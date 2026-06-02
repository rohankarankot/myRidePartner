import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { TripStatus } from '@prisma/client';

import { TripChatsService } from './trip-chats.service';
import { PrismaService } from '../prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { UploadService } from '../upload/upload.service';

describe('TripChatsService', () => {
  const prisma = {
    trip: { findUnique: jest.fn() },
    joinRequest: { findFirst: jest.fn(), findMany: jest.fn() },
    tripChat: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    tripChatMessage: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    userBlock: { findFirst: jest.fn() },
  };

  const eventsGateway = {
    emitToChatRoom: jest.fn(),
    isUserActivelyViewingChat: jest.fn().mockReturnValue(false),
  };

  const notificationsService = {
    create: jest.fn(),
    sendPushOnly: jest.fn(),
    sendBatchPushOnly: jest.fn(),
  };

  const uploadService = {
    deleteFileByUrl: jest.fn(),
    deleteFileByPublicId: jest.fn(),
  };

  const service = new TripChatsService(
    prisma as unknown as PrismaService,
    eventsGateway as unknown as EventsGateway,
    notificationsService as unknown as NotificationsService,
    uploadService as unknown as UploadService,
  );

  /**
   * The consolidated assertChatAccess query now fetches everything from
   * prisma.trip.findUnique with nested includes for chat, joinRequests,
   * and creator block lists.
   */
  const baseTripWithRelations = {
    id: 99,
    documentId: 'trip-123',
    status: TripStatus.PUBLISHED,
    creatorId: 10,
    chat: null, // no pre-created chat
    joinRequests: [], // no approved join requests for the queried user
    creator: {
      blockedUsers: [],
      blockedByUsers: [],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.trip.findUnique.mockResolvedValue(baseTripWithRelations);
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
    prisma.trip.findUnique.mockResolvedValueOnce({
      ...baseTripWithRelations,
      joinRequests: [{ id: 1 }], // has an approved join request
    });

    await expect(service.getChatAccess('trip-123', 22)).resolves.toEqual({
      tripDocumentId: 'trip-123',
      canAccess: true,
      tripStatus: TripStatus.PUBLISHED,
      isCaptain: false,
    });
  });

  it('denies a pending or unrelated passenger from fetching messages', async () => {
    await expect(service.getMessages('trip-123', 22)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('blocks access when the trip is completed', async () => {
    prisma.trip.findUnique.mockResolvedValueOnce({
      ...baseTripWithRelations,
      status: TripStatus.COMPLETED,
    });

    await expect(service.getMessages('trip-123', 10)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('creates a message for an approved passenger and emits a realtime event', async () => {
    // Return trip with approved join request for user 22
    prisma.trip.findUnique.mockResolvedValueOnce({
      ...baseTripWithRelations,
      chat: { id: 5, documentId: 'chat-1' },
      joinRequests: [{ id: 1 }],
    });
    prisma.tripChatMessage.create.mockResolvedValueOnce({
      id: 7,
      documentId: 'msg-1',
      message: 'Hello',
      createdAt: new Date('2026-03-21T10:00:00.000Z'),
      sender: {
        id: 22,
        username: 'rider',
        userProfile: null,
      },
      replyTo: null,
    });

    const result = await service.createMessage('trip-123', 22, {
      message: ' Hello ',
    });

    expect(result.message).toBe('Hello');
    expect(eventsGateway.emitToChatRoom).toHaveBeenCalledWith(
      'trip-123',
      'chat_message_created',
      result,
    );
  });

  it('rejects missing or empty messages with a bad request error', async () => {
    await expect(
      service.createMessage('trip-123', 10, {
        message: undefined as unknown as string,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.createMessage('trip-123', 10, { message: '   ' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('sends batch push notifications only to recipients not actively viewing the trip chat', async () => {
    // Trip with a pre-created chat, captain is the sender
    prisma.trip.findUnique.mockResolvedValueOnce({
      ...baseTripWithRelations,
      chat: { id: 5, documentId: 'chat-1' },
    });
    prisma.tripChatMessage.create.mockResolvedValueOnce({
      id: 7,
      documentId: 'msg-1',
      message: 'Hello there',
      createdAt: new Date('2026-03-21T10:00:00.000Z'),
      sender: {
        id: 10,
        username: 'captain',
        userProfile: { fullName: 'Captain', avatar: null },
      },
      replyTo: null,
    });
    // notifyTripChatRecipients fetches approved passengers
    prisma.joinRequest.findMany.mockResolvedValueOnce([
      { passengerId: 22 },
      { passengerId: 33 },
    ]);

    await service.createMessage('trip-123', 10, { message: 'Hello there' });

    // Now uses sendBatchPushOnly with all recipient IDs (sender excluded)
    expect(notificationsService.sendBatchPushOnly).toHaveBeenCalledTimes(1);
    expect(notificationsService.sendBatchPushOnly).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Captain',
        message: 'Hello there',
        userIds: expect.arrayContaining([22, 33]) as unknown as number[],
        threadId: 'trip-123',
        data: expect.objectContaining({
          tripId: 'trip-123',
          screen: 'trip-chat',
          messageDocumentId: 'msg-1',
        }) as unknown as Record<string, unknown>,
      }),
    );
  });

  it('deletes the chat when a trip is completed and emits chat_deleted', async () => {
    prisma.tripChat.findFirst.mockResolvedValueOnce({ id: 12 });
    prisma.tripChatMessage.findMany.mockResolvedValueOnce([]);

    await service.deleteChatForCompletedTrip('trip-123');

    expect(prisma.tripChat.delete).toHaveBeenCalledWith({ where: { id: 12 } });
    expect(eventsGateway.emitToChatRoom).toHaveBeenCalledWith(
      'trip-123',
      'chat_deleted',
      { tripDocumentId: 'trip-123' },
    );
  });

  it('deletes uploaded chat photos before removing the completed trip chat', async () => {
    prisma.tripChat.findFirst.mockResolvedValueOnce({ id: 12 });
    prisma.tripChatMessage.findMany.mockResolvedValueOnce([
      {
        message:
          '__ride_media__::{"url":"https://res.cloudinary.com/demo/image/upload/v123/myridepartner/avatars/chat-a.jpg","caption":"One"}',
      },
      {
        message:
          '__ride_media__::{"url":"https://res.cloudinary.com/demo/image/upload/v123/myridepartner/avatars/chat-a.jpg","caption":"Duplicate"}',
      },
      { message: 'Plain text message' },
      {
        message:
          '__ride_media__::{"url":"https://res.cloudinary.com/demo/image/upload/v456/myridepartner/avatars/chat-b.jpg","caption":"Two"}',
      },
    ]);

    await service.deleteChatForCompletedTrip('trip-123');

    expect(uploadService.deleteFileByUrl).toHaveBeenCalledTimes(2);
    expect(uploadService.deleteFileByUrl).toHaveBeenCalledWith(
      'https://res.cloudinary.com/demo/image/upload/v123/myridepartner/avatars/chat-a.jpg',
    );
    expect(uploadService.deleteFileByUrl).toHaveBeenCalledWith(
      'https://res.cloudinary.com/demo/image/upload/v456/myridepartner/avatars/chat-b.jpg',
    );
    expect(prisma.tripChat.delete).toHaveBeenCalledWith({ where: { id: 12 } });
  });

  it('throws when the trip does not exist', async () => {
    prisma.trip.findUnique.mockResolvedValueOnce(null);

    await expect(
      service.getChatAccess('missing-trip', 10),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('attaches the replied-to message when sending a reply', async () => {
    // Trip with pre-created chat for captain
    prisma.trip.findUnique.mockResolvedValueOnce({
      ...baseTripWithRelations,
      chat: { id: 5, documentId: 'chat-1' },
    });
    prisma.tripChatMessage.findUnique.mockResolvedValueOnce({
      id: 3,
      chatId: 5,
      documentId: 'msg-parent',
      message: 'Original message',
      createdAt: new Date('2026-03-21T09:58:00.000Z'),
      sender: {
        id: 10,
        username: 'captain',
        userProfile: null,
      },
    });
    prisma.tripChatMessage.create.mockResolvedValueOnce({
      id: 7,
      documentId: 'msg-1',
      message: 'Reply message',
      createdAt: new Date('2026-03-21T10:00:00.000Z'),
      sender: {
        id: 10,
        username: 'captain',
        userProfile: null,
      },
      replyTo: {
        documentId: 'msg-parent',
        message: 'Original message',
        createdAt: new Date('2026-03-21T09:58:00.000Z'),
        sender: {
          id: 10,
          username: 'captain',
          userProfile: null,
        },
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
        }) as unknown as Record<string, unknown>,
      }),
    );
    expect(result.replyTo).toEqual(
      expect.objectContaining({
        documentId: 'msg-parent',
        message: 'Original message',
      }),
    );
  });

  it('blocks access when the user is blocked by the trip creator', async () => {
    prisma.trip.findUnique.mockResolvedValueOnce({
      ...baseTripWithRelations,
      creator: {
        blockedUsers: [],
        blockedByUsers: [{ id: 1 }], // user 22 blocked the creator
      },
    });

    await expect(service.getChatAccess('trip-123', 22)).resolves.toEqual(
      expect.objectContaining({
        canAccess: false,
      }),
    );
  });

  it('creates a fallback chat when trip.chat is null (pre-creation missed)', async () => {
    // Trip without a pre-created chat
    prisma.trip.findUnique.mockResolvedValueOnce({
      ...baseTripWithRelations,
      chat: null,
    });
    prisma.tripChat.create.mockResolvedValueOnce({
      id: 5,
    });
    prisma.tripChatMessage.create.mockResolvedValueOnce({
      id: 7,
      documentId: 'msg-1',
      message: 'Hello',
      createdAt: new Date('2026-03-21T10:00:00.000Z'),
      sender: {
        id: 10,
        username: 'captain',
        userProfile: null,
      },
      replyTo: null,
    });

    const result = await service.createMessage('trip-123', 10, {
      message: 'Hello',
    });

    expect(prisma.tripChat.create).toHaveBeenCalledWith({
      data: { tripId: 99 },
      select: { id: true },
    });
    expect(result.documentId).toBe('msg-1');
  });
});
