import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

@Injectable()
export class ExpoPushService {
  private expo: Expo;
  private readonly logger = new Logger(ExpoPushService.name);

  constructor() {
    this.expo = new Expo();
  }

  /**
   * Send a push notification to a specific Expo push token.
   */
  async sendNotification(pushToken: string, title: string, body: string, data?: any) {
    if (!Expo.isExpoPushToken(pushToken)) {
      this.logger.error(`Push token ${pushToken} is not a valid Expo push token`);
      return;
    }

    const messages: ExpoPushMessage[] = [
      {
        to: pushToken,
        sound: 'default',
        title,
        body,
        data,
      },
    ];

    try {
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];

      for (const chunk of chunks) {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      }

      this.logger.log(`Sent push notification to ${pushToken}. Tickets: ${JSON.stringify(tickets)}`);
      return tickets;
    } catch (error) {
      this.logger.error(`Error sending push notification: ${error}`);
    }
  }
}
