import apiClient from '../api/api-client';
import { Notification, NotificationResponse, SingleNotificationResponse } from '../types/api';

class NotificationService {
    async getNotifications(userId: number): Promise<Notification[]> {
        const response = await apiClient.get<NotificationResponse>(
            `/api/notifications?filters[user][id][$eq]=${userId}&sort[0]=createdAt:desc&populate=*`
        );
        return response.data.data;
    }

    async getUnreadCount(userId: number): Promise<number> {
        const response = await apiClient.get<NotificationResponse>(
            `/api/notifications?filters[user][id][$eq]=${userId}&filters[read][$eq]=false`
        );
        return response.data.meta.pagination.total;
    }

    async markAsRead(documentId: string): Promise<Notification> {
        const response = await apiClient.put<SingleNotificationResponse>(`/api/notifications/${documentId}`, {
            data: { read: true }
        });
        return response.data.data;
    }

    async markAllAsRead(userId: number): Promise<void> {
        const unread = await this.getNotifications(userId);
        const unreadItems = unread.filter(n => !n.read);

        await Promise.all(
            unreadItems.map(n => this.markAsRead(n.documentId))
        );
    }

    async deleteNotification(documentId: string): Promise<void> {
        await apiClient.delete(`/api/notifications/${documentId}`);
    }

    async deleteAllNotifications(userId: number): Promise<void> {
        const all = await this.getNotifications(userId);
        await Promise.all(all.map(n => this.deleteNotification(n.documentId)));
    }
}

export const notificationService = new NotificationService();
