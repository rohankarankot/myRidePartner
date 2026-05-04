import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { router } from 'expo-router';

type NotificationData = {
  screen?: string;
  tripId?: string;
  relatedId?: string;
  messageDocumentId?: string;
  type?: string;
  image?: string;
  avatar?: string;
  senderAvatar?: string;
  title?: string;
};

class NotifeeService {
  private channelIdPromise: Promise<string> | null = null;

  async requestPermission() {
    return notifee.requestPermission();
  }

  private async ensureChannelId() {
    if (!this.channelIdPromise) {
      this.channelIdPromise = notifee.createChannel({
        id: 'default',
        name: 'Default',
        importance: AndroidImportance.HIGH,
      });
    }

    return this.channelIdPromise;
  }

  private resolveAvatarUrl(data?: NotificationData) {
    return data?.avatar || data?.senderAvatar || data?.image || undefined;
  }

  async displayRemoteNotification(params: {
    title?: string;
    body?: string;
    data?: NotificationData;
  }) {
    await this.requestPermission();

    const channelId = await this.ensureChannelId();
    const avatarUrl = this.resolveAvatarUrl(params.data);

    await notifee.displayNotification({
      title: params.title || 'New Notification',
      body: params.body || '',
      data: Object.fromEntries(
        Object.entries(params.data || {}).map(([key, value]) => [key, String(value ?? '')]),
      ),
      android: {
        channelId,
        pressAction: {
          id: 'default',
        },
        smallIcon: 'ic_launcher',
        largeIcon: avatarUrl,
      },
      ios: avatarUrl
        ? {
            attachments: [
              {
                url: avatarUrl,
              },
            ],
          }
        : undefined,
    });
  }

  handlePress(data?: NotificationData) {
    if (!data) return;

    if (data.screen === 'trip-chat' && data.tripId) {
      router.push({
        pathname: '/trip-chat/[tripId]',
        params: {
          tripId: data.tripId,
          initialMessageId: data.messageDocumentId,
        },
      } as any);
      return;
    }

    if (data.tripId) {
      router.push({
        pathname: '/trip/[id]',
        params: { id: data.tripId },
      } as any);
      return;
    }

    if (data.type === 'JOIN_REQUEST' && data.relatedId) {
      router.push({
        pathname: '/requests/[documentId]',
        params: { documentId: data.relatedId },
      } as any);
      return;
    }

    if (data.type === 'TRIP_COMPLETED' || data.type === 'TRIP_UPDATE') {
      router.push('/(tabs)/activity');
    }
  }

  subscribeForegroundEvents() {
    return notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        this.handlePress(detail.notification?.data as NotificationData | undefined);
      }
    });
  }
}

export const notifeeService = new NotifeeService();
