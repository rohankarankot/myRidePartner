import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { router } from 'expo-router';

type NotificationData = {
  screen?: string;
  tripId?: string;
  tripDocumentId?: string;
  relatedId?: string;
  messageDocumentId?: string;
  type?: string;
  image?: string;
  avatar?: string;
  senderAvatar?: string;
  city?: string;
  groupId?: string;
  groupDocumentId?: string;
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
    const avatarUrl = data?.avatar || data?.senderAvatar || data?.image || undefined;
    return avatarUrl?.trim() ? avatarUrl.trim() : undefined;
  }

  private resolveTripId(data?: NotificationData) {
    return data?.tripId || data?.tripDocumentId || data?.relatedId || undefined;
  }

  private resolveThreadId(data?: NotificationData) {
    if (!data) return undefined;

    const tripId = this.resolveTripId(data);

    if (data.screen === 'trip-chat' && tripId) {
      return `trip-chat:${tripId}`;
    }

    if ((data.screen === 'community-group-chat' || data.screen === 'group-chat') && (data.groupDocumentId || data.relatedId)) {
      return `group-chat:${data.groupDocumentId || data.relatedId}`;
    }

    if ((data.screen === 'community-chat' || data.screen === 'public-chat') && data.city) {
      return `public-chat:${data.city.trim().toLowerCase()}`;
    }

    return data.relatedId || tripId || data.groupDocumentId;
  }

  private buildNotificationId(params: { title?: string; body?: string; data?: NotificationData }): string {
    const tripId = this.resolveTripId(params.data);

    if (params.data?.screen === 'trip-chat' && tripId) {
      return params.data.messageDocumentId
        ? `trip-chat:${tripId}:${params.data.messageDocumentId}`
        : `trip-chat:${tripId}`;
    }

    if (params.data?.relatedId) {
      return `${params.data.type || 'notification'}:${params.data.relatedId}`;
    }

    return `notification:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
  }

  async displayRemoteNotification(params: {
    title?: string;
    body?: string;
    data?: NotificationData;
  }) {
    await this.requestPermission();

    const channelId = await this.ensureChannelId();
    const avatarUrl = this.resolveAvatarUrl(params.data);
    const notificationId = this.buildNotificationId(params);
    const threadId = this.resolveThreadId(params.data);

    await notifee.displayNotification({
      id: notificationId,
      title: params.title || 'New Notification',
      body: params.body || '',
      data: Object.fromEntries(
        Object.entries(params.data || {}).map(([key, value]) => [key, String(value ?? '')]),
      ),
      android: {
        channelId,
        groupId: threadId,
        pressAction: {
          id: 'default',
        },
        smallIcon: 'ic_launcher',
        ...(avatarUrl ? { largeIcon: avatarUrl } : {}),
      },
      ios: {
        ...(threadId ? { threadId } : {}),
        ...(avatarUrl
          ? {
              attachments: [
                {
                  url: avatarUrl,
                },
              ],
            }
          : {}),
      },
    });
  }

  async clearTripChatNotifications(tripId: string) {
    const normalized = tripId.trim();
    await this.clearNotifications((data) => {
      const screen = data.screen?.toLowerCase();
      const messageTripId = this.resolveTripId(data);
      return screen === 'trip-chat' && messageTripId === normalized;
    });
  }

  async clearCommunityChatNotifications(city?: string | null) {
    if (!city) return;
    const normalized = city.trim().toLowerCase();
    await this.clearNotifications((data) => {
      const screen = data.screen?.toLowerCase();
      const cityValue = data.city?.trim().toLowerCase();
      return (screen === 'community-chat' || screen === 'public-chat') && cityValue === normalized;
    });
  }

  async clearCommunityGroupChatNotifications(groupDocumentId?: string | null) {
    if (!groupDocumentId) return;
    const normalized = groupDocumentId.trim();
    await this.clearNotifications((data) => {
      const screen = data.screen?.toLowerCase();
      const groupId = data.groupDocumentId || data.relatedId;
      return (screen === 'community-group-chat' || screen === 'group-chat') && groupId === normalized;
    });
  }

  private async clearNotifications(
    predicate: (data: NotificationData) => boolean,
  ) {
    const displayedNotifications = await notifee.getDisplayedNotifications();
    const matching = displayedNotifications.filter((item) => predicate(item.notification?.data as NotificationData));

    await Promise.all(
      matching.map((item) => {
        if (item.id) {
          return notifee.cancelNotification(item.id);
        }
        return Promise.resolve();
      })
    );
  }

  handlePress(data?: NotificationData) {
    if (!data) return;

    if (data.screen === 'community-group' && data.groupDocumentId) {
      router.push({
        pathname: '/community-group/[documentId]',
        params: { documentId: data.groupDocumentId },
      } as any);
      return;
    }

    if (data.screen === 'community-groups' && data.groupDocumentId) {
      router.push({
        pathname: '/community-group/[documentId]',
        params: { documentId: data.groupDocumentId },
      } as any);
      return;
    }

    if (data.screen === 'community-group-chat' && data.groupDocumentId) {
      router.push({
        pathname: '/community-group-chat/[documentId]',
        params: { documentId: data.groupDocumentId },
      } as any);
      return;
    }

    if ((data.screen === 'community-chat' || data.screen === 'public-chat') && data.city) {
      router.push({
        pathname: '/community-chat',
        params: { city: data.city },
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

    const tripId = this.resolveTripId(data);
    if (data.screen === 'trip-chat' && tripId) {
      router.push({
        pathname: '/trip-chat/[tripId]',
        params: {
          tripId,
          initialMessageId: data.messageDocumentId,
        },
      } as any);
      return;
    }

    if (
      tripId &&
      data.screen !== 'community-group-chat' &&
      data.screen !== 'community-groups' &&
      data.screen !== 'community-chat' &&
      data.screen !== 'public-chat'
    ) {
      router.push({
        pathname: '/trip/[id]',
        params: { id: tripId },
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
