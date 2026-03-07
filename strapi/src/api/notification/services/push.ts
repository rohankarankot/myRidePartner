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
                console.log(`No push token found for user ${userId}`);
                return;
            }

            const pushToken = userProfiles[0].pushToken;

            // Check if it's a valid Expo push token
            if (!Expo.isExpoPushToken(pushToken)) {
                console.error(`Push token ${pushToken} is not a valid Expo push token`);
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
                } catch (error) {
                    console.error('Error sending push notification chunk:', error);
                }
            }

            console.log(`Push notification sent to user ${userId}`);
        } catch (error) {
            console.error('Error in sendPushNotification service:', error);
        }
    }
};
