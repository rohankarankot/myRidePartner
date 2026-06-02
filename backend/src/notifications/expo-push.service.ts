import { Injectable } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

@Injectable()
export class ExpoPushService {
  private readonly expo = new Expo();

  async sendNotification(
    pushToken: string,
    title: string,
    message: string,
    data?: Record<string, unknown>,
    opts?: { threadId?: string; image?: string },
  ) {
    if (!Expo.isExpoPushToken(pushToken)) {
      throw new Error(`Invalid Expo push token: ${pushToken as string}`);
    }

    const notifications: ExpoPushMessage[] = [
      {
        to: pushToken,
        sound: 'default',
        title,
        body: message,
        data,
        ...(opts?.image ? { image: opts.image } : {}),
        ...(opts?.threadId ? { channelId: 'default' } : {}),
      },
    ];

    await this.expo.sendPushNotificationsAsync(notifications);
  }

  async sendBatchNotifications(
    pushTokens: string[],
    title: string,
    message: string,
    data?: Record<string, unknown>,
    opts?: { threadId?: string; image?: string },
  ) {
    const validTokens = pushTokens.filter((token) =>
      Expo.isExpoPushToken(token),
    );
    if (validTokens.length === 0) {
      return;
    }

    const notifications: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body: message,
      data,
      ...(opts?.image ? { image: opts.image } : {}),
      ...(opts?.threadId ? { channelId: 'default' } : {}),
    }));

    const chunks = this.expo.chunkPushNotifications(notifications);
    for (const chunk of chunks) {
      try {
        await this.expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error('Failed to send push notification chunk:', error);
      }
    }
  }
}
