import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { EventsGateway } from '../events/events.gateway';
import {
  CreatePublicChatMessageDto,
  GetPublicChatMessagesQueryDto,
} from './dto/public-chat.dto';
import { normalizePublicChatCity } from './public-chat-room.util';

const publicChatSenderSelect = {
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

@Injectable()
export class PublicChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async getMessages(userId: number, query?: GetPublicChatMessagesQueryDto) {
    await this.assertUserExists(userId);
    const city = await this.resolveChatCity(userId, query?.city);

    const limit = Math.min(Math.max(Number(query?.limit ?? 40), 1), 100);
    const cursor = query?.cursor;
    const cursorMessage = cursor
      ? await this.prisma.publicChatMessage.findFirst({
          where: { documentId: cursor, city },
          select: { id: true, createdAt: true },
        })
      : null;

    const messages = await this.prisma.publicChatMessage.findMany({
      where: cursorMessage
        ? {
            city,
            OR: [
              { createdAt: { lt: cursorMessage.createdAt } },
              {
                createdAt: cursorMessage.createdAt,
                id: { lt: cursorMessage.id },
              },
            ],
          }
        : { city },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      include: {
        sender: {
          select: publicChatSenderSelect,
        },
        replyTo: {
          include: {
            sender: {
              select: publicChatSenderSelect,
            },
          },
        },
      },
    });

    const hasMore = messages.length > limit;
    const selectedMessages = (hasMore ? messages.slice(0, limit) : messages).reverse();

    return {
      messages: selectedMessages.map((message) => ({
        id: message.id,
        documentId: message.documentId,
        message: message.message,
        city: message.city,
        createdAt: message.createdAt,
        sender: message.sender,
        replyTo: message.replyTo,
      })),
      hasMore,
      nextCursor: selectedMessages[0]?.documentId ?? null,
      city,
    };
  }

  async createMessage(userId: number, body: CreatePublicChatMessageDto) {
    await this.assertUserExists(userId);
    const city = await this.resolveChatCity(userId, body?.city);

    if (typeof body?.message !== 'string') {
      throw new BadRequestException('Message is required');
    }

    const trimmedMessage = body.message.trim();
    if (!trimmedMessage) {
      throw new BadRequestException('Message cannot be empty');
    }

    let replyToId: number | undefined;
    if (body.replyToDocumentId) {
      const referencedMessage = await this.prisma.publicChatMessage.findFirst({
        where: { documentId: body.replyToDocumentId, city },
        select: { id: true },
      });
      if (referencedMessage) {
        replyToId = referencedMessage.id;
      }
    }

    const message = await this.prisma.publicChatMessage.create({
      data: {
        senderId: userId,
        message: trimmedMessage,
        city,
        replyToId,
      },
      include: {
        sender: {
          select: publicChatSenderSelect,
        },
        replyTo: {
          include: {
            sender: {
              select: publicChatSenderSelect,
            },
          },
        },
      },
    });

    const payload = {
      id: message.id,
      documentId: message.documentId,
      message: message.message,
      city: message.city,
      createdAt: message.createdAt,
      sender: message.sender,
      replyTo: message.replyTo,
    };

    this.eventsGateway.emitToPublicChatRoom(city, 'public_chat_message_created', payload);

    return payload;
  }

  private async resolveChatCity(userId: number, requestedCity?: string) {
    const requested = normalizePublicChatCity(requestedCity);
    if (requested) {
      return requested;
    }

    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
      select: { city: true },
    });

    const profileCity = normalizePublicChatCity(profile?.city);
    if (profileCity) {
      return profileCity;
    }

    throw new BadRequestException('Select a city before entering community chat');
  }

  private async assertUserExists(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new BadRequestException('User was not found');
    }
  }
}
