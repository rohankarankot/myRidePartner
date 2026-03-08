import { Expo, ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo();

export default {
    async sendPushNotification(userId: number, title: string, body: string, data: any = {}) {
        try {
            // Find the user's profile to get the push token
            const userProfiles = await strapi.documents('api::user-profile.user-profile').findMany({
                filters: { userId: { id: userId } }
            });

            if (userProfiles.length === 0 || !userProfiles[0].pushToken) {
                console.log(`[PushService] No push token found for user ${userId}. Skipping push notification.`);
                return;
            }

            const pushToken = userProfiles[0].pushToken;
            console.log(`[PushService] Attempting to send push to user ${userId} with token: ${pushToken}`);

            // Check if it's a valid Expo push token
            if (!Expo.isExpoPushToken(pushToken)) {
                console.error(`[PushService] Token ${pushToken} for user ${userId} is not a valid Expo push token`);
                return;
            }

            const messages: ExpoPushMessage[] = [{
                to: pushToken,
                sound: 'default',
                title: title,
                body: body,
                data: data,
            }];

            const chunks = expo.chunkPushNotifications(messages);
            const tickets = [];

            for (const chunk of chunks) {
                try {
                    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                    tickets.push(...ticketChunk);
                    console.log(`[PushService] Successfully sent chunk to Expo API`);
                } catch (error) {
                    console.error('[PushService] Error sending push notification chunk:', error);
                }
            }

            console.log(`[PushService] Push notification delivery attempted for user ${userId}`);
        } catch (error) {
            console.error('[PushService] Error in sendPushNotification service:', error);
        }
    }
};
