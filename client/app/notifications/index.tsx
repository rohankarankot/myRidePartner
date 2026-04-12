import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Toast from 'react-native-toast-message';

import { useThemeColor } from '@/hooks/use-theme-color';
import { notificationService } from '@/services/notification-service';
import { useAuth } from '@/context/auth-context';
import { Notification } from '@/types/api';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { ListPageSkeleton } from '@/components/skeleton/page-skeletons';
import {
  NotificationRow,
  NotificationsConfirmModal,
  NotificationsEmptyState,
} from '@/features/notifications/components';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const primaryColor = useThemeColor({}, 'primary');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const dangerColor = useThemeColor({}, 'danger');

  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const swipeableRefs = useRef<Record<string, Swipeable | null>>({});

  const { data: notifications = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => notificationService.getNotifications(user!.id),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (user?.id) {
      notificationService.markAllAsRead(user.id).then(() => {
        queryClient.invalidateQueries({ queryKey: ['unread-notifications-count', user.id] });
      });
    }
  }, [queryClient, user?.id]);

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => notificationService.deleteNotification(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      Toast.show({ type: 'success', text1: 'Deleted', text2: 'Notification removed successfully.' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to delete notification.' }),
  });

  const clearAllMutation = useMutation({
    mutationFn: () => notificationService.deleteAllNotifications(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count', user?.id] });
      Toast.show({ type: 'success', text1: 'Cleared', text2: 'All notifications have been removed.' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to clear notifications.' }),
  });

  const confirmDelete = useCallback((documentId: string) => {
    swipeableRefs.current[documentId]?.close();
    setPendingDeleteId(documentId);
  }, []);

  const handleConfirmSingleDelete = () => {
    if (pendingDeleteId) {
      deleteMutation.mutate(pendingDeleteId);
      setPendingDeleteId(null);
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    let data = notification.data || {};
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        data = {};
      }
    }

    const tripId = (data as any).tripId || (notification as any).tripId;
    const relatedId = (data as any).relatedId || (notification as any).relatedId;

    if (tripId) {
      router.push({ pathname: '/trip/[id]', params: { id: tripId } } as any);
      return;
    }
    if (notification.type === 'JOIN_REQUEST' && relatedId) {
      router.push({ pathname: '/requests/[documentId]', params: { documentId: relatedId } } as any);
      return;
    }
    if (notification.type === 'TRIP_COMPLETED' || notification.type === 'TRIP_UPDATE') {
      router.push('/(tabs)/activity');
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'JOIN_REQUEST':
        return 'person.2.fill' as const;
      case 'TRIP_COMPLETED':
        return 'checkmark.circle.fill' as const;
      case 'TRIP_UPDATE':
        return 'car.fill' as const;
      case 'SYSTEM':
        return 'gearshape.fill' as const;
      default:
        return 'bell.fill' as const;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerTitleStyle: { fontWeight: '800' },
          headerShown: true,
          headerBackTitle: 'Profile',
          headerStyle: { backgroundColor },
          headerTintColor: textColor,
          headerShadowVisible: false,
          headerRight: () =>
            notifications.length > 0 ? (
              <Pressable className="mr-3 px-3 py-1.5 rounded-full border border-dashed" style={{ borderColor: dangerColor }} onPress={() => setShowClearAllModal(true)}>
                <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: dangerColor }}>
                  Clear All
                </Text>
              </Pressable>
            ) : null,
        }}
      />

      {isLoading && !isRefetching ? (
        <ListPageSkeleton />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.documentId}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={primaryColor} colors={[primaryColor]} />
          }
          ListEmptyComponent={
            <NotificationsEmptyState subtextColor={subtextColor} textColor={textColor} />
          }
          renderItem={({ item }) => (
            <NotificationRow
              borderColor={borderColor}
              cardColor={cardColor}
              confirmDelete={confirmDelete}
              dangerColor={dangerColor}
              getIconForType={getIconForType}
              item={item}
              onPress={handleNotificationPress}
              primaryColor={primaryColor}
              subtextColor={subtextColor}
              swipeableRefs={swipeableRefs}
              textColor={textColor}
            />
          )}
        />
      )}
      <NotificationsConfirmModal
        visible={!!pendingDeleteId}
        backgroundColor={cardColor}
        borderColor={borderColor}
        confirmLabel="Delete"
        dangerColor={dangerColor}
        icon="trash.fill"
        message="This update will be removed from your activity log forever."
        onCancel={() => {
          if (pendingDeleteId) {
            swipeableRefs.current[pendingDeleteId]?.close();
          }
          setPendingDeleteId(null);
        }}
        onConfirm={handleConfirmSingleDelete}
        pending={deleteMutation.isPending}
        subtextColor={subtextColor}
        textColor={textColor}
        title="Permanently Delete?"
      />

      <NotificationsConfirmModal
        visible={showClearAllModal}
        backgroundColor={cardColor}
        borderColor={borderColor}
        confirmLabel="Clear All"
        dangerColor={dangerColor}
        icon="bell.slash.fill"
        message={`You are about to delete all ${notifications.length} notifications. This action cannot be undone.`}
        onCancel={() => setShowClearAllModal(false)}
        onConfirm={() => {
          setShowClearAllModal(false);
          clearAllMutation.mutate();
        }}
        pending={clearAllMutation.isPending}
        subtextColor={subtextColor}
        textColor={textColor}
        title="Purge Inbox?"
      />
    </SafeAreaView>
  );
}
