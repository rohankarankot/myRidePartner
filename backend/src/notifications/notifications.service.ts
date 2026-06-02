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

    // Emit to socket for in-app sync, but avoid duplicating trip completion alerts
    // because the push notification listener already surfaces them on the client.
    if (data.type !== NotificationType.TRIP_COMPLETED) {
      this.eventsGateway.emitToUser(
        data.userId,
        'new_notification',
        notification,
      );
    }

    // Send push notification
    try {
      const userProfile = await this.prisma.userProfile.findUnique({
        where: { userId: data.userId },
        select: { pushToken: true },
      });

      if (userProfile?.pushToken) {
        const optimizedImage = this.optimizeImageUrl(data.data?.image);
        await this.expoPushService.sendNotification(
          userProfile.pushToken,
          data.title,
          data.message,
          {
            type: data.type,
            relatedId: data.relatedId,
            ...data.data,
            image: optimizedImage, // Also include in data for client-side handling
            icon: optimizedImage, // Redundancy for Android handlers
          },
          {
            threadId: data.data?.threadId,
            image: optimizedImage,
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
    threadId?: string;
    image?: string;
  }) {
    try {
      const userProfile = await this.prisma.userProfile.findUnique({
        where: { userId: data.userId },
        select: { pushToken: true },
      });

      if (userProfile?.pushToken) {
        const optimizedImage = this.optimizeImageUrl(data.image);
        await this.expoPushService.sendNotification(
          userProfile.pushToken,
          data.title,
          data.message,
          {
            ...data.data,
            image: optimizedImage, // Also include in data
            icon: optimizedImage, // Redundancy for Android handlers
          },
          {
            threadId: data.threadId,
            image: optimizedImage,
          },
        );
      }
    } catch (error) {
      console.error('Failed to send push-only notification:', error);
    }
  }

  async sendBatchPushOnly(data: {
    title: string;
    message: string;
    userIds: number[];
    data?: any;
    threadId?: string;
    image?: string;
  }) {
    if (!data.userIds || data.userIds.length === 0) {
      return;
    }

    try {
      const userProfiles = await this.prisma.userProfile.findMany({
        where: { userId: { in: data.userIds } },
        select: { userId: true, pushToken: true },
      });

      const tokens = userProfiles
        .map((profile) => profile.pushToken)
        .filter((token): token is string => Boolean(token));

      if (tokens.length === 0) {
        return;
      }

      const optimizedImage = this.optimizeImageUrl(data.image);
      await this.expoPushService.sendBatchNotifications(
        tokens,
        data.title,
        data.message,
        {
          ...data.data,
          image: optimizedImage,
          icon: optimizedImage,
        },
        {
          threadId: data.threadId,
          image: optimizedImage,
        },
      );
    } catch (error) {
      console.error('Failed to send batch push-only notifications:', error);
    }
  }

  async createMany(
    notifications: Array<{
      userId: number;
      title: string;
      message: string;
      type: NotificationType;
      relatedId?: string;
      data?: any;
    }>,
  ) {
    if (notifications.length === 0) {
      return;
    }

    await this.prisma.notification.createMany({
      data: notifications.map((n) => ({
        title: n.title,
        message: n.message,
        type: n.type,
        relatedId: n.relatedId,
        data: n.data,
        userId: n.userId,
      })),
    });

    const createdNotifications = await this.prisma.notification.findMany({
      where: {
        userId: { in: notifications.map((n) => n.userId) },
        relatedId: notifications[0].relatedId || undefined,
      },
      orderBy: { createdAt: 'desc' },
      take: notifications.length,
    });

    for (const notification of createdNotifications) {
      if (notification.type !== NotificationType.TRIP_COMPLETED) {
        this.eventsGateway.emitToUser(
          notification.userId,
          'new_notification',
          notification,
        );
      }
    }

    try {
      const userProfiles = await this.prisma.userProfile.findMany({
        where: { userId: { in: notifications.map((n) => n.userId) } },
        select: { userId: true, pushToken: true },
      });

      const tokens = userProfiles
        .map((p) => p.pushToken)
        .filter((token): token is string => Boolean(token));

      if (tokens.length > 0) {
        const firstNotif = notifications[0];
        const optimizedImage = this.optimizeImageUrl(firstNotif.data?.image);

        await this.expoPushService.sendBatchNotifications(
          tokens,
          firstNotif.title,
          firstNotif.message,
          {
            type: firstNotif.type,
            relatedId: firstNotif.relatedId,
            ...firstNotif.data,
            image: optimizedImage,
            icon: optimizedImage,
          },
          {
            threadId:
              firstNotif.data?.threadId || firstNotif.relatedId || undefined,
            image: optimizedImage,
          },
        );
      }
    } catch (error) {
      console.error(
        'Failed to send batch push notifications in createMany:',
        error,
      );
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

  private optimizeImageUrl(url?: string | null): string | undefined {
    if (!url) return undefined;

    // 1. Trim whitespace
    let optimized = url.trim();

    // 2. Ensure HTTPS
    if (optimized.startsWith('http://')) {
      optimized = optimized.replace('http://', 'https://');
    }

    // 3. Cloudinary optimization (resize for notifications)
    if (
      optimized.includes('res.cloudinary.com') &&
      !optimized.includes('/w_')
    ) {
      // Use high-compatibility transformations, avoiding f_auto to ensure standard formats
      optimized = optimized.replace(
        '/upload/',
        '/upload/c_fill,g_face,w_200,h_200,q_auto/',
      );
    }

    // 4. Trim trailing slashes at the end to ensure we don't return a malformed URL
    return optimized.replace(/\/+$/, '');
  }
}
