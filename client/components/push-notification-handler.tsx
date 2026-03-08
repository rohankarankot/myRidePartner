import { useEffect } from 'react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { pushNotificationService } from '@/services/push-notification-service';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

export const PushNotificationHandler = () => {
    const { data: profile } = useUserProfile();
    const router = useRouter();
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

    useEffect(() => {
        // Handle notification clicks
        const responseSubscription = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
            const data = response.notification.request.content.data;
            console.log('Notification clicked with data:', data);

            if (data?.tripId) {
                router.push({
                    pathname: '/trip/[id]',
                    params: { id: data.tripId }
                } as any);
            } else if (data?.type === 'JOIN_REQUEST' && data?.relatedId) {
                router.push({
                    pathname: '/requests/[documentId]',
                    params: { documentId: data.relatedId }
                } as any);
            } else if (data?.type === 'TRIP_COMPLETED' || data?.type === 'TRIP_UPDATE') {
                router.push('/(tabs)/activity');
            }
        });

        // Handle notifications received while app is foregrounded
        const notificationSubscription = Notifications.addNotificationReceivedListener((notification) => {
            console.log('Notification received in foreground:', notification);
            // Invalidate queries to refresh badges and inbox
            queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        });

        return () => {
            responseSubscription.remove();
            notificationSubscription.remove();
        };
    }, []);

    return null;
};
