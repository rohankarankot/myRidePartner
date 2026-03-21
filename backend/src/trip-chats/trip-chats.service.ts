import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { JoinRequestStatus, Prisma, TripStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { EventsGateway } from '../events/events.gateway';

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
  ) {}

  async getChatAccess(tripDocumentId: string, userId: number) {
    const trip = await this.getTripOrThrow(tripDocumentId);
    const canAccess = await this.canAccessTripChat(trip, userId);

    return {
      tripDocumentId: trip.documentId,
      canAccess,
      tripStatus: trip.status,
    };
  }

  async getMessages(tripDocumentId: string, userId: number) {
    const trip = await this.assertChatAccess(tripDocumentId, userId);
    const chat = await this.findOrCreateChat(trip);

    const messages = await this.runWithChatTableGuard(() =>
      this.prisma.tripChatMessage.findMany({
        where: { chatId: chat.id },
        orderBy: { createdAt: 'asc' },
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

    return messages!.map((message) => ({
      id: message.id,
      documentId: message.documentId,
      message: message.message,
      createdAt: message.createdAt,
      sender: message.sender,
    }));
  }

  async createMessage(tripDocumentId: string, userId: number, body: string) {
    const trip = await this.assertChatAccess(tripDocumentId, userId);
    const trimmedMessage = body.trim();

    if (!trimmedMessage) {
      throw new ForbiddenException('Message cannot be empty');
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
