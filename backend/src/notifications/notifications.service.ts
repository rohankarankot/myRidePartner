import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { ExpoPushService } from './expo-push.service';
import { NotificationType } from '@prisma/client';
import {
  PaginationParams,
  buildPaginationMeta,
  PaginatedMeta,
} from '../common/utils/query.utils';

export interface NotificationFilters {
  userId?: number;
  read?: boolean;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
    private readonly expoPushService: ExpoPushService,
  ) {}

  /**
   * Get paginated notifications with optional filters.
   */
  async findAll(
    pagination: PaginationParams,
    filters: NotificationFilters = {},
  ): Promise<{ data: any[]; meta: PaginatedMeta }> {
    const where: any = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }
    if (filters.read !== undefined) {
      where.read = filters.read;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, username: true, email: true },
          },
        },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data: notifications,
      meta: buildPaginationMeta(total, pagination),
    };
  }

  /**
   * Get unread count for a user.
   */
  async getUnreadCount(userId: number): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  /**
   * Create a notification.
   */
  async create(data: {
    title: string;
    message: string;
    type: NotificationType;
    userId: number;
    data?: any;
    relatedId?: string;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type,
        data: data.data,
        relatedId: data.relatedId,
        user: { connect: { id: data.userId } },
      },
    });

    // Emit to socket
    this.eventsGateway.emitToUser(data.userId, 'new_notification', notification);

    // Send push notification
    try {
      const userProfile = await this.prisma.userProfile.findUnique({
        where: { userId: data.userId },
        select: { pushToken: true },
      });

      if (userProfile?.pushToken) {
        await this.expoPushService.sendNotification(
          userProfile.pushToken,
          data.title,
          data.message,
          {
            type: data.type,
            relatedId: data.relatedId,
            ...data.data,
          },
        );
      }
    } catch (error) {
      // Don't fail the whole request if push notification fails
      console.error('Failed to send push notification:', error);
    }

    return notification;
  }

  async sendPushOnly(data: {
    title: string;
    message: string;
    userId: number;
    data?: any;
  }) {
    try {
      const userProfile = await this.prisma.userProfile.findUnique({
        where: { userId: data.userId },
        select: { pushToken: true },
      });

      if (userProfile?.pushToken) {
        await this.expoPushService.sendNotification(
          userProfile.pushToken,
          data.title,
          data.message,
          data.data,
        );
      }
    } catch (error) {
      console.error('Failed to send push-only notification:', error);
    }
  }

  /**
   * Mark a single notification as read.
   */
  async markAsRead(documentId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { documentId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { documentId },
      data: { read: true },
    });
  }

  /**
   * Mark all notifications as read for a user.
   */
  async markAllAsRead(userId: number) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return { message: 'All notifications marked as read' };
  }

  /**
   * Delete a notification.
   */
  async delete(documentId: string) {
    return this.prisma.notification.delete({
      where: { documentId },
    });
  }

  /**
   * Delete all notifications for a user.
   */
  async deleteAll(userId: number) {
    await this.prisma.notification.deleteMany({
      where: { userId },
    });

    return { message: 'All notifications deleted' };
  }
}
