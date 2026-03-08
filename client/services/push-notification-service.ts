import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { userService } from './user-service';

// Configure how notifications are handled when the app is foregrounded
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

class PushNotificationService {
    async requestPermissionsAsync() {
        if (!Device.isDevice) {
            console.log('Must use physical device for Push Notifications');
            return false;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        return finalStatus === 'granted';
    }

    async registerForPushNotificationsAsync(profileDocumentId: string, currentSavedToken?: string) {
        const hasPermissions = await this.requestPermissionsAsync();
        if (!hasPermissions) {
            console.log('Failed to get permissions for push notifications!');
            return;
        }

        try {
            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ??
                Constants?.easConfig?.projectId;

            if (!projectId) {
                console.error('Project ID not found in expo config. Push notifications might not work.');
            }

            const token = (await Notifications.getExpoPushTokenAsync({
                projectId,
            })).data;

            console.log('Current Expo Push Token:', token);

            // Only update if it's different from what's stored in the profile
            if (token !== currentSavedToken) {
                console.log('Updating push token on backend...');
                await userService.updatePushToken(profileDocumentId, token);
            } else {
                console.log('Push token is already up to date.');
            }

            return token;
        } catch (e) {
            console.error('Error getting push token:', e);
        }
    }
}

export const pushNotificationService = new PushNotificationService();
