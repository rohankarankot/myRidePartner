import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { JoinRequestStatus, Prisma, TripStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { GetTripChatMessagesQueryDto } from './dto/trip-chats.dto';

type TripWithRelations = {
  id: number;
  documentId: string;
  status: TripStatus;
  creatorId: number;
};

@Injectable()
export class TripChatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getChatAccess(tripDocumentId: string, userId: number) {
    const trip = await this.getTripOrThrow(tripDocumentId);
    const canAccess = await this.canAccessTripChat(trip, userId);

    return {
      tripDocumentId: trip.documentId,
      canAccess,
      tripStatus: trip.status,
      isCaptain: trip.creatorId === userId,
    };
  }

  async getMessages(
    tripDocumentId: string,
    userId: number,
    query?: GetTripChatMessagesQueryDto,
  ) {
    const trip = await this.assertChatAccess(tripDocumentId, userId);
    const chat = await this.findOrCreateChat(trip);
    const limit = Math.min(Math.max(Number(query?.limit ?? 40), 1), 100);
    const cursor = query?.cursor;
    const cursorMessage = cursor
      ? await this.runWithChatTableGuard(() =>
          this.prisma.tripChatMessage.findUnique({
            where: { documentId: cursor },
            select: { id: true, createdAt: true, chatId: true },
          }),
        )
      : null;

    const messages = await this.runWithChatTableGuard(() =>
      this.prisma.tripChatMessage.findMany({
        where: {
          chatId: chat.id,
          ...(cursorMessage && cursorMessage.chatId === chat.id
            ? {
                OR: [
                  { createdAt: { lt: cursorMessage.createdAt } },
                  {
                    createdAt: cursorMessage.createdAt,
                    id: { lt: cursorMessage.id },
                  },
                ],
              }
            : {}),
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: limit + 1,
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              email: true,
              userProfile: {
                select: {
                  avatar: true,
                  fullName: true,
                },
              },
            },
          },
        },
      }),
    );

    const fetchedMessages = messages ?? [];
    const hasMore = fetchedMessages.length > limit;
    const selectedMessages = (hasMore ? fetchedMessages.slice(0, limit) : fetchedMessages).reverse();

    return {
      messages: selectedMessages.map((message) => ({
        id: message.id,
        documentId: message.documentId,
        message: message.message,
        createdAt: message.createdAt,
        sender: message.sender,
      })),
      hasMore,
      nextCursor: selectedMessages[0]?.documentId ?? null,
    };
  }

  async createMessage(tripDocumentId: string, userId: number, body: string) {
    const trip = await this.assertChatAccess(tripDocumentId, userId);

    if (typeof body !== 'string') {
      throw new BadRequestException('Message is required');
    }

    const trimmedMessage = body.trim();

    if (!trimmedMessage) {
      throw new BadRequestException('Message cannot be empty');
    }

    const chat = await this.findOrCreateChat(trip);
    const message = await this.runWithChatTableGuard(() =>
      this.prisma.tripChatMessage.create({
        data: {
          chatId: chat.id,
          senderId: userId,
          message: trimmedMessage,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              email: true,
              userProfile: {
                select: {
                  avatar: true,
                  fullName: true,
                },
              },
            },
          },
        },
      }),
    );

    const payload = {
      id: message!.id,
      documentId: message!.documentId,
      message: message!.message,
      createdAt: message!.createdAt,
      sender: message!.sender,
    };

    this.eventsGateway.emitToChatRoom(trip.documentId, 'chat_message_created', payload);
    await this.notifyTripChatRecipients(trip, payload);

    return payload;
  }

  async deleteChatForCompletedTrip(tripDocumentId: string) {
    const chat = await this.runWithChatTableGuard(
      () =>
        this.prisma.tripChat.findFirst({
          where: {
            trip: { documentId: tripDocumentId },
          },
          select: { id: true },
        }),
      { swallowMissingTable: true },
    );

    if (!chat) {
      return;
    }

    await this.runWithChatTableGuard(
      () =>
        this.prisma.tripChat.delete({
          where: { id: chat.id },
        }),
      { swallowMissingTable: true },
    );

    this.eventsGateway.emitToChatRoom(tripDocumentId, 'chat_deleted', {
      tripDocumentId,
    });
  }

  async canJoinSocketRoom(tripDocumentId: string, userId: number) {
    const trip = await this.getTripOrThrow(tripDocumentId);
    return this.canAccessTripChat(trip, userId);
  }

  private async assertChatAccess(tripDocumentId: string, userId: number) {
    const trip = await this.getTripOrThrow(tripDocumentId);
    const canAccess = await this.canAccessTripChat(trip, userId);

    if (!canAccess) {
      throw new ForbiddenException('You do not have access to this trip chat');
    }

    if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
      throw new ForbiddenException('This trip chat is no longer available');
    }

    return trip;
  }

  private async canAccessTripChat(trip: TripWithRelations, userId: number) {
    if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
      return false;
    }

    const isBlocked = await this.prisma.userBlock.findFirst({
      where: {
        OR: [
          {
            blockerId: userId,
            blockedUserId: trip.creatorId,
          },
          {
            blockerId: trip.creatorId,
            blockedUserId: userId,
          },
        ],
      },
      select: { id: true },
    });

    if (isBlocked) {
      return false;
    }

    if (trip.creatorId === userId) {
      return true;
    }

    const approvedRequest = await this.prisma.joinRequest.findFirst({
      where: {
        tripId: trip.id,
        passengerId: userId,
        status: JoinRequestStatus.APPROVED,
      },
      select: { id: true },
    });

    return Boolean(approvedRequest);
  }

  private async findOrCreateChat(trip: TripWithRelations) {
    const existingChat = await this.runWithChatTableGuard(() =>
      this.prisma.tripChat.findUnique({
        where: { tripId: trip.id },
        select: {
          id: true,
          documentId: true,
        },
      }),
    );

    if (existingChat) {
      return existingChat;
    }

    return (await this.runWithChatTableGuard(() =>
      this.prisma.tripChat.create({
        data: {
          tripId: trip.id,
        },
        select: {
          id: true,
          documentId: true,
        },
      }),
    ))!;
  }

  private async notifyTripChatRecipients(
    trip: TripWithRelations,
    message: {
      documentId: string;
      message: string;
      sender: {
        id: number;
        username: string | null;
        userProfile?: {
          fullName?: string | null;
        } | null;
      };
    },
  ) {
    const approvedPassengers = await this.prisma.joinRequest.findMany({
      where: {
        tripId: trip.id,
        status: JoinRequestStatus.APPROVED,
      },
      select: {
        passengerId: true,
      },
    });

    const recipientIds = Array.from(
      new Set([trip.creatorId, ...approvedPassengers.map((request) => request.passengerId)]),
    ).filter((recipientId) => recipientId !== message.sender.id);

    if (recipientIds.length === 0) {
      return;
    }

    const senderName =
      message.sender.userProfile?.fullName || message.sender.username || 'Someone';
    const messagePreview = this.buildChatNotificationPreview(message.message);

    await Promise.all(
      recipientIds.map(async (recipientId) => {
        if (this.eventsGateway.isUserActivelyViewingChat(trip.documentId, recipientId)) {
          return;
        }

        await this.notificationsService.sendPushOnly({
          title: senderName,
          message: messagePreview,
          userId: recipientId,
          data: {
            tripId: trip.documentId,
            screen: 'trip-chat',
            messageDocumentId: message.documentId,
          },
        });
      }),
    );
  }

  private buildChatNotificationPreview(message: string) {
    if (message.startsWith('__ride_location__::')) {
      return 'Shared a location in your ride chat.';
    }

    return message.length > 120 ? `${message.slice(0, 117)}...` : message;
  }

  private async getTripOrThrow(tripDocumentId: string): Promise<TripWithRelations> {
    const trip = await this.prisma.trip.findUnique({
      where: { documentId: tripDocumentId },
      select: {
        id: true,
        documentId: true,
        status: true,
        creatorId: true,
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    return trip;
  }

  private async runWithChatTableGuard<T>(
    operation: () => Promise<T>,
    options?: { swallowMissingTable?: boolean },
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      if (this.isMissingChatTableError(error)) {
        if (options?.swallowMissingTable) {
          return null;
        }

        throw new ServiceUnavailableException(
          'Trip chat is not ready yet. Please run the database migration for chat tables.',
        );
      }

      throw error;
    }
  }

  private isMissingChatTableError(error: unknown) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
      return false;
    }

    const driverError = error.meta?.driverAdapterError as
      | { cause?: { table?: string; kind?: string } }
      | undefined;
    const missingTable = driverError?.cause?.table;

    return (
      error.code === 'P2021' &&
      (missingTable === 'public.TripChat' || missingTable === 'public.TripChatMessage')
    );
  }
}
