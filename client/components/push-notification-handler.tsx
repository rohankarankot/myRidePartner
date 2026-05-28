import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useUserProfile } from '@/hooks/use-user-profile';
import { pushNotificationService } from '@/services/push-notification-service';
import * as Notifications from 'expo-notifications';
import { useQueryClient } from '@tanstack/react-query';
import { notifeeService } from '@/services/notifee-service';
import { buildNotificationDedupeKey, shouldSuppressNotification } from '@/shared/lib/notification-dedupe';

export const PushNotificationHandler = () => {
    const { data: profile } = useUserProfile();
    const queryClient = useQueryClient();

    useEffect(() => {
        const syncPushToken = async () => {
            if (!profile?.documentId) {
                return;
            }

            const hasPermission = await pushNotificationService.hasNotificationPermissionAsync();
            if (!hasPermission) {
                return;
            }

            console.log('Verifying push notification registration...');
            const token = await pushNotificationService.registerForPushNotificationsAsync(profile.documentId, profile.pushToken);
            if (token) {
                console.log('Push token synced successfully:', token);
            }
        };

        void syncPushToken();

        const subscription = AppState.addEventListener('change', (nextState) => {
            if (nextState === 'active') {
                void syncPushToken();
            }
        });

        return () => subscription.remove();
    }, [profile?.documentId, profile?.pushToken]);

    useEffect(() => notifeeService.subscribeForegroundEvents(), []);

    useEffect(() => {
        const notificationSubscription = Notifications.addNotificationReceivedListener((notification) => {
            const data = notification.request.content.data as any;
            console.log('Notification received in foreground:', notification);
            const dedupeKey = buildNotificationDedupeKey({
                title: notification.request.content.title,
                body: notification.request.content.body,
                data,
            });

            if (shouldSuppressNotification(dedupeKey)) {
                return;
            }

            queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });

            notifeeService.displayRemoteNotification({
                title: notification.request.content.title || 'New Notification',
                body: notification.request.content.body || undefined,
                data,
            });
        });

        return () => {
            notificationSubscription.remove();
        };
    }, [queryClient]);

    return null;
};
