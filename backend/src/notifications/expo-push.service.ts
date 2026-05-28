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
      throw new Error(`Invalid Expo push token: ${pushToken}`);
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
}
