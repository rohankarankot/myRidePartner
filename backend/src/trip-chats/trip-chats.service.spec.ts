import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JoinRequestStatus, TripStatus } from '@prisma/client';
import { TripChatsService } from './trip-chats.service';

describe('TripChatsService', () => {
  const prisma = {
    trip: { findUnique: jest.fn() },
    joinRequest: { findFirst: jest.fn(), findMany: jest.fn() },
    tripChat: { create: jest.fn(), findFirst: jest.fn(), findUnique: jest.fn(), delete: jest.fn() },
    tripChatMessage: { findMany: jest.fn(), create: jest.fn(), findUnique: jest.fn() },
    userBlock: { findFirst: jest.fn() },
  } as any;

  const eventsGateway = {
    emitToChatRoom: jest.fn(),
    isUserActivelyViewingChat: jest.fn().mockReturnValue(false),
  } as any;

  const notificationsService = {
    create: jest.fn(),
    sendPushOnly: jest.fn(),
  } as any;

  const service = new TripChatsService(prisma, eventsGateway, notificationsService);

  const baseTrip = {
    id: 99,
    documentId: 'trip-123',
    status: TripStatus.PUBLISHED,
    creatorId: 10,
    chat: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.trip.findUnique.mockResolvedValue(baseTrip);
    prisma.joinRequest.findFirst.mockResolvedValue(null);
    prisma.joinRequest.findMany.mockResolvedValue([]);
    prisma.tripChat.findUnique.mockResolvedValue(null);
    prisma.userBlock.findFirst.mockResolvedValue(null);
    prisma.tripChatMessage.findUnique.mockResolvedValue(null);
  });

  it('allows the captain to access the trip chat', async () => {
    await expect(service.getChatAccess('trip-123', 10)).resolves.toEqual({
      tripDocumentId: 'trip-123',
      canAccess: true,
      tripStatus: TripStatus.PUBLISHED,
      isCaptain: true,
    });
  });

  it('allows an approved passenger to access the trip chat', async () => {
    prisma.joinRequest.findFirst.mockResolvedValueOnce({ id: 1, status: JoinRequestStatus.APPROVED });

    await expect(service.getChatAccess('trip-123', 22)).resolves.toEqual({
      tripDocumentId: 'trip-123',
      canAccess: true,
      tripStatus: TripStatus.PUBLISHED,
      isCaptain: false,
    });
  });

  it('denies a pending or unrelated passenger from fetching messages', async () => {
    await expect(service.getMessages('trip-123', 22)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('blocks access when the trip is completed', async () => {
    prisma.trip.findUnique.mockResolvedValueOnce({
      ...baseTrip,
      status: TripStatus.COMPLETED,
    });

    await expect(service.getMessages('trip-123', 10)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('creates a message for an approved passenger and emits a realtime event', async () => {
    prisma.joinRequest.findFirst.mockResolvedValueOnce({ id: 1, status: JoinRequestStatus.APPROVED });
    prisma.tripChat.create.mockResolvedValueOnce({ id: 5, documentId: 'chat-1' });
    prisma.tripChatMessage.create.mockResolvedValueOnce({
      id: 7,
      documentId: 'msg-1',
      message: 'Hello',
      createdAt: new Date('2026-03-21T10:00:00.000Z'),
      sender: { id: 22, username: 'rider', email: 'rider@example.com', userProfile: null },
    });

    const result = await service.createMessage('trip-123', 22, { message: ' Hello ' });

    expect(result.message).toBe('Hello');
    expect(eventsGateway.emitToChatRoom).toHaveBeenCalledWith('trip-123', 'chat_message_created', result);
  });

  it('rejects missing or empty messages with a bad request error', async () => {
    await expect(service.createMessage('trip-123', 10, { message: undefined as unknown as string })).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.createMessage('trip-123', 10, { message: '   ' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('sends chat notifications only to recipients not actively viewing the trip chat', async () => {
    prisma.tripChat.create.mockResolvedValueOnce({ id: 5, documentId: 'chat-1' });
    prisma.tripChatMessage.create.mockResolvedValueOnce({
      id: 7,
      documentId: 'msg-1',
      message: 'Hello there',
      createdAt: new Date('2026-03-21T10:00:00.000Z'),
      sender: { id: 10, username: 'captain', email: 'captain@example.com', userProfile: { fullName: 'Captain' } },
    });
    prisma.joinRequest.findMany.mockResolvedValueOnce([{ passengerId: 22 }, { passengerId: 33 }]);
    eventsGateway.isUserActivelyViewingChat.mockImplementation((_tripId: string, userId: number) => userId === 22);

    await service.createMessage('trip-123', 10, { message: 'Hello there' });

    expect(notificationsService.sendPushOnly).toHaveBeenCalledTimes(1);
    expect(notificationsService.sendPushOnly).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Captain',
        message: 'Hello there',
        userId: 33,
      }),
    );
  });

  it('deletes the chat when a trip is completed and emits chat_deleted', async () => {
    prisma.tripChat.findFirst.mockResolvedValueOnce({ id: 12 });

    await service.deleteChatForCompletedTrip('trip-123');

    expect(prisma.tripChat.delete).toHaveBeenCalledWith({ where: { id: 12 } });
    expect(eventsGateway.emitToChatRoom).toHaveBeenCalledWith('trip-123', 'chat_deleted', { tripDocumentId: 'trip-123' });
  });

  it('throws when the trip does not exist', async () => {
    prisma.trip.findUnique.mockResolvedValueOnce(null);

    await expect(service.getChatAccess('missing-trip', 10)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('attaches the replied-to message when sending a reply', async () => {
    prisma.tripChat.create.mockResolvedValueOnce({ id: 5, documentId: 'chat-1' });
    prisma.tripChatMessage.findUnique.mockResolvedValueOnce({
      id: 3,
      chatId: 5,
      documentId: 'msg-parent',
      message: 'Original message',
      createdAt: new Date('2026-03-21T09:58:00.000Z'),
      sender: { id: 10, username: 'captain', email: 'captain@example.com', userProfile: null },
    });
    prisma.tripChatMessage.create.mockResolvedValueOnce({
      id: 7,
      documentId: 'msg-1',
      message: 'Reply message',
      createdAt: new Date('2026-03-21T10:00:00.000Z'),
      sender: { id: 10, username: 'captain', email: 'captain@example.com', userProfile: null },
      replyTo: {
        documentId: 'msg-parent',
        message: 'Original message',
        createdAt: new Date('2026-03-21T09:58:00.000Z'),
        sender: { id: 10, username: 'captain', email: 'captain@example.com', userProfile: null },
      },
    });

    const result = await service.createMessage('trip-123', 10, {
      message: 'Reply message',
      replyToDocumentId: 'msg-parent',
    });

    expect(prisma.tripChatMessage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          replyToId: 3,
        }),
      }),
    );
    expect(result.replyTo).toEqual(
      expect.objectContaining({
        documentId: 'msg-parent',
        message: 'Original message',
      }),
    );
  });
});
