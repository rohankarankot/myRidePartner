import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { JoinRequestStatus, Prisma, TripStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CreateTripChatMessageDto,
  GetTripChatMessagesQueryDto,
} from './dto/trip-chats.dto';
import { UploadService } from '../upload/upload.service';

const MEDIA_MESSAGE_PREFIX = '__ride_media__::';
const LOCATION_MESSAGE_PREFIX = '__ride_location__::';

type TripWithRelations = {
  id: number;
  documentId: string;
  status: TripStatus;
  creatorId: number;
};

const tripChatMessageSenderSelect = {
  id: true,
  username: true,
  email: true,
  userProfile: {
    select: {
      avatar: true,
      fullName: true,
    },
  },
} satisfies Prisma.UserSelect;

const repliedToMessageInclude = {
  sender: {
    select: tripChatMessageSenderSelect,
  },
} satisfies Prisma.TripChatMessageInclude;

const tripChatMessageInclude = {
  sender: {
    select: tripChatMessageSenderSelect,
  },
  replyTo: {
    include: repliedToMessageInclude,
  },
} satisfies Prisma.TripChatMessageInclude;

type MediaMessagePayload = {
  url?: string;
};

@Injectable()
export class TripChatsService {
  private readonly logger = new Logger(TripChatsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
    private readonly notificationsService: NotificationsService,
    private readonly uploadService: UploadService,
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
          ...tripChatMessageInclude,
        },
      }),
    );

    const fetchedMessages = messages ?? [];
    const hasMore = fetchedMessages.length > limit;
    const selectedMessages = (
      hasMore ? fetchedMessages.slice(0, limit) : fetchedMessages
    ).reverse();

    return {
      messages: selectedMessages.map((message) => ({
        id: message.id,
        documentId: message.documentId,
        message: message.message,
        createdAt: message.createdAt,
        sender: message.sender,
        replyTo: message.replyTo
          ? {
              documentId: message.replyTo.documentId,
              message: message.replyTo.message,
              createdAt: message.replyTo.createdAt,
              sender: message.replyTo.sender,
            }
          : null,
      })),
      hasMore,
      nextCursor: selectedMessages[0]?.documentId ?? null,
    };
  }

  async createMessage(
    tripDocumentId: string,
    userId: number,
    payload: CreateTripChatMessageDto,
  ) {
    const trip = await this.assertChatAccess(tripDocumentId, userId);
    const body = payload?.message;

    if (typeof body !== 'string') {
      throw new BadRequestException('Message is required');
    }

    const trimmedMessage = body.trim();

    if (!trimmedMessage) {
      throw new BadRequestException('Message cannot be empty');
    }

    const chat = await this.findOrCreateChat(trip);
    let replyToMessage: Awaited<
      ReturnType<typeof this.prisma.tripChatMessage.findUnique>
    > | null = null;

    if (payload.replyToDocumentId) {
      replyToMessage = await this.runWithChatTableGuard(() =>
        this.prisma.tripChatMessage.findUnique({
          where: { documentId: payload.replyToDocumentId },
          include: repliedToMessageInclude,
        }),
      );

      if (!replyToMessage || replyToMessage.chatId !== chat.id) {
        throw new BadRequestException(
          'Reply target was not found in this chat',
        );
      }
    }

    const message = await this.runWithChatTableGuard(() =>
      this.prisma.tripChatMessage.create({
        data: {
          chatId: chat.id,
          senderId: userId,
          message: trimmedMessage,
          replyToId: replyToMessage?.id,
        },
        include: tripChatMessageInclude,
      }),
    );

    const responsePayload = {
      id: message!.id,
      documentId: message!.documentId,
      message: message!.message,
      createdAt: message!.createdAt,
      sender: message!.sender,
      replyTo: message!.replyTo
        ? {
            documentId: message!.replyTo.documentId,
            message: message!.replyTo.message,
            createdAt: message!.replyTo.createdAt,
            sender: message!.replyTo.sender,
          }
        : null,
    };

    this.eventsGateway.emitToChatRoom(
      trip.documentId,
      'chat_message_created',
      responsePayload,
    );
    await this.notifyTripChatRecipients(trip, responsePayload);

    return responsePayload;
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

    const messages = await this.runWithChatTableGuard(
      () =>
        this.prisma.tripChatMessage.findMany({
          where: { chatId: chat.id },
          select: { message: true },
        }),
      { swallowMissingTable: true },
    );

    const mediaUrls = Array.from(
      new Set(
        (messages ?? [])
          .map((message) => this.extractMediaUrl(message.message))
          .filter((url): url is string => Boolean(url)),
      ),
    );

    await Promise.all(
      mediaUrls.map((url) => this.uploadService.deleteFileByUrl(url)),
    );

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

  private extractMediaUrl(message: string): string | null {
    if (!message.startsWith(MEDIA_MESSAGE_PREFIX)) {
      return null;
    }

    try {
      const parsed = JSON.parse(
        message.slice(MEDIA_MESSAGE_PREFIX.length),
      ) as MediaMessagePayload;
      return typeof parsed.url === 'string' && parsed.url.trim()
        ? parsed.url
        : null;
    } catch {
      return null;
    }
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
          avatar?: string | null;
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
      new Set([
        trip.creatorId,
        ...approvedPassengers.map((request) => request.passengerId),
      ]),
    ).filter((recipientId) => recipientId !== message.sender.id);

    if (recipientIds.length === 0) {
      return;
    }

    const senderName =
      message.sender.userProfile?.fullName ||
      message.sender.username ||
      'Someone';
    const messagePreview = this.buildChatNotificationPreview(message.message);

    this.logger.log(
      `Notifying ${recipientIds.length} recipients. Sender: ${senderName}, Avatar: ${message.sender.userProfile?.avatar}`,
    );

    await Promise.all(
      recipientIds.map(async (recipientId) => {
        if (
          this.eventsGateway.isUserActivelyViewingChat(
            trip.documentId,
            recipientId,
          )
        ) {
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
          threadId: trip.documentId,
          image: message.sender.userProfile?.avatar || undefined,
        });
      }),
    );
  }

  private buildChatNotificationPreview(message: string) {
    if (message.startsWith(LOCATION_MESSAGE_PREFIX)) {
      return 'Shared a location in your ride chat.';
    }

    if (message.startsWith(MEDIA_MESSAGE_PREFIX)) {
      return 'Shared a photo in your ride chat.';
    }

    return message.length > 120 ? `${message.slice(0, 117)}...` : message;
  }

  private async getTripOrThrow(
    tripDocumentId: string,
  ): Promise<TripWithRelations> {
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
      (missingTable === 'public.TripChat' ||
        missingTable === 'public.TripChatMessage')
    );
  }
}
