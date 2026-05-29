import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import { socketService } from '@/services/socket-service';
import Toast from 'react-native-toast-message';
import { notifeeService } from '@/services/notifee-service';
import { buildNotificationDedupeKey, shouldSuppressNotification } from '@/shared/lib/notification-dedupe';
import { useChatStateStore } from '@/store/chat-state-store';

export function useSocketEvents() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const activeTripChatId = useChatStateStore((state) => state.activeTripChatId);

    useEffect(() => {
        if (!user?.id) return;

        console.log('[Socket] Setting up event listeners for user:', user.id);

        // 1. New Notification
        const handleNewNotification = (notification: any) => {
            console.log('[Socket] Received new_notification:', notification);
            const dedupeKey = buildNotificationDedupeKey(notification);
            if (shouldSuppressNotification(dedupeKey)) {
                return;
            }

            const notificationTripId = String(notification?.data?.tripId || notification?.data?.tripDocumentId || notification?.data?.relatedId || '').trim();
            if (notification?.data?.screen === 'trip-chat' && notificationTripId && activeTripChatId === notificationTripId) {
                void notifeeService.clearTripChatNotifications(notificationTripId);
                return;
            }

            // Invalidate queries to refresh UI
            queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
            queryClient.invalidateQueries({ queryKey: ['unread-notifications-count', user.id] });

            notifeeService.displayRemoteNotification({
                title: notification.title || 'New Notification',
                body: notification.message,
                data: notification?.data,
            }).catch((error) => {
                console.error('Failed to display Notifee notification:', error);
                if (notification?.data?.screen === 'trip-chat') {
                    return;
                }

                Toast.show({
                    type: 'info',
                    text1: notification.title || 'New Notification',
                    text2: notification.message,
                });
            });
        };

        // 2. Join Request Created (for Captains)
        const handleJoinRequestCreated = (data: any) => {
            console.log('[Socket] Received join_request_created:', data);
            queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
            queryClient.invalidateQueries({ queryKey: ['unread-notifications-count', user.id] });
            // For Captains, refresh the trip details to show new request
            queryClient.invalidateQueries({ queryKey: ['trip-details', data.tripId] });
            queryClient.invalidateQueries({ queryKey: ['trip-chat-access', data.tripId] });
        };

        // 3. Join Request Updated (for Passengers)
        const handleJoinRequestUpdated = (data: any) => {
            console.log('[Socket] Received join_request_updated:', data);
            queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
            queryClient.invalidateQueries({ queryKey: ['unread-notifications-count', user.id] });
            queryClient.invalidateQueries({ queryKey: ['join-requests', user.id] }); // Activity Screen
            queryClient.invalidateQueries({ queryKey: ['trip-details', data.tripId] });
            queryClient.invalidateQueries({ queryKey: ['trip-chat-access', data.tripId] });
        };

        // 4. Trip Updated (Generic status changes)
        const handleTripUpdated = (data: any) => {
            console.log('[Socket] Received trip_updated:', data);
            queryClient.invalidateQueries({ queryKey: ['trip-details', data.documentId] });
            queryClient.invalidateQueries({ queryKey: ['trips', user.id] });
            queryClient.invalidateQueries({ queryKey: ['trip-chat-access', data.documentId] });
            queryClient.invalidateQueries({ queryKey: ['trip-chat-messages', data.documentId] });
        };

        const handleChatDeleted = (data: any) => {
            console.log('[Socket] Received chat_deleted:', data);
            queryClient.removeQueries({ queryKey: ['trip-chat-messages', data.tripDocumentId] });
            queryClient.invalidateQueries({ queryKey: ['trip-chat-access', data.tripDocumentId] });
        };

        // Register listeners
        socketService.on('new_notification', handleNewNotification);
        socketService.on('join_request_created', handleJoinRequestCreated);
        socketService.on('join_request_updated', handleJoinRequestUpdated);
        socketService.on('trip_updated', handleTripUpdated);
        socketService.on('chat_deleted', handleChatDeleted);

        return () => {
            console.log('[Socket] Cleaning up event listeners');
            socketService.off('new_notification', handleNewNotification);
            socketService.off('join_request_created', handleJoinRequestCreated);
            socketService.off('join_request_updated', handleJoinRequestUpdated);
            socketService.off('trip_updated', handleTripUpdated);
            socketService.off('chat_deleted', handleChatDeleted);
        };
    }, [activeTripChatId, user?.id, queryClient]);
}
