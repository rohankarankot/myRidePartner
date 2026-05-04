import { useEffect } from 'react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { pushNotificationService } from '@/services/push-notification-service';
import * as Notifications from 'expo-notifications';
import { useQueryClient } from '@tanstack/react-query';
import { notifeeService } from '@/services/notifee-service';

export const PushNotificationHandler = () => {
    const { data: profile } = useUserProfile();
    const queryClient = useQueryClient();

    useEffect(() => {
        // Explicitly request permissions on app open
        pushNotificationService.requestPermissionsAsync();
    }, []);

    useEffect(() => {
        if (profile && profile.documentId) {
            // Check/request permissions when profile becomes available (logged in)
            pushNotificationService.requestPermissionsAsync().then(granted => {
                if (granted) {
                    // Always try to register/update token to ensure it's correct for this device
                    // The service can be optimized internally if needed
                    console.log('Verifying push notification registration...');
                    pushNotificationService.registerForPushNotificationsAsync(profile.documentId, profile.pushToken);
                }
            });
        }
    }, [profile?.documentId]);

    useEffect(() => notifeeService.subscribeForegroundEvents(), []);

    useEffect(() => {
        const notificationSubscription = Notifications.addNotificationReceivedListener((notification) => {
            const data = notification.request.content.data as any;
            console.log('Notification received in foreground:', notification);

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
