import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { NotificationType } from '@prisma/client';
import { PaginationParams } from '@app/common';

@Controller()
export class NotificationServiceController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @MessagePattern({ cmd: 'findAllNotifications' })
  async findAll(@Payload() payload: { pagination: PaginationParams; filters?: any }) {
    return this.notificationsService.findAll(payload.pagination, payload.filters);
  }

  @MessagePattern({ cmd: 'getUnreadCount' })
  async getUnreadCount(@Payload() payload: { userId: number }) {
    return this.notificationsService.getUnreadCount(payload.userId);
  }

  @MessagePattern({ cmd: 'createNotification' })
  async create(@Payload() payload: { title: string; message: string; type: NotificationType; userId: number; data?: any; relatedId?: string }) {
    return this.notificationsService.create(payload);
  }

  @MessagePattern({ cmd: 'sendPushOnly' })
  async sendPushOnly(@Payload() payload: { title: string; message: string; userId: number; data?: any; threadId?: string; image?: string }) {
    return this.notificationsService.sendPushOnly(payload);
  }

  @MessagePattern({ cmd: 'markNotificationAsRead' })
  async markAsRead(@Payload() payload: { documentId: string }) {
    return this.notificationsService.markAsRead(payload.documentId);
  }

  @MessagePattern({ cmd: 'markAllNotificationsAsRead' })
  async markAllAsRead(@Payload() payload: { userId: number }) {
    return this.notificationsService.markAllAsRead(payload.userId);
  }

  @MessagePattern({ cmd: 'deleteNotification' })
  async delete(@Payload() payload: { documentId: string }) {
    return this.notificationsService.delete(payload.documentId);
  }

  @MessagePattern({ cmd: 'deleteAllNotifications' })
  async deleteAll(@Payload() payload: { userId: number }) {
    return this.notificationsService.deleteAll(payload.userId);
  }
}
