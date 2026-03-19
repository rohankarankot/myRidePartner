import apiClient from '../api/api-client';
import { Notification, NotificationResponse } from '../types/api';

class NotificationService {
    async getNotifications(userId: number): Promise<Notification[]> {
        const { data } = await apiClient.get<NotificationResponse>(
            `/notifications?userId=${userId}&pageSize=100`
        );
        return data.data;
    }

    async getUnreadCount(userId: number): Promise<number> {
        const { data } = await apiClient.get<NotificationResponse>(
            `/notifications?userId=${userId}&read=false&pageSize=1`
        );
        return data.meta.pagination.total;
    }

    async markAsRead(documentId: string): Promise<Notification> {
        const { data } = await apiClient.put<Notification>(`/notifications/${documentId}/read`);
        return data;
    }

    async markAllAsRead(userId: number): Promise<void> {
        await apiClient.put(`/notifications/read-all/${userId}`);
    }

    async deleteNotification(documentId: string): Promise<void> {
        await apiClient.delete(`/notifications/${documentId}`);
    }

    async deleteAllNotifications(userId: number): Promise<void> {
        await apiClient.delete(`/notifications/all/${userId}`);
    }
}

export const notificationService = new NotificationService();
