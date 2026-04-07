import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, Modal, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Toast from 'react-native-toast-message';

import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { notificationService } from '@/services/notification-service';
import { useAuth } from '@/context/auth-context';
import { Notification } from '@/types/api';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Spinner } from '@/components/ui/spinner';

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
      Toast.show({ type: 'success', text1: 'Notification deleted' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to delete notification' }),
  });

  const clearAllMutation = useMutation({
    mutationFn: () => notificationService.deleteAllNotifications(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count', user?.id] });
      Toast.show({ type: 'success', text1: 'All notifications cleared' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to clear notifications' }),
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
        return 'person.2.fill';
      case 'TRIP_COMPLETED':
        return 'checkmark.circle.fill';
      case 'TRIP_UPDATE':
        return 'car';
      case 'SYSTEM':
        return 'gearshape.fill';
      default:
        return 'bell.fill';
    }
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    _drag: Animated.AnimatedInterpolation<number>,
    documentId: string
  ) => {
    const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1], extrapolate: 'clamp' });
    return (
      <Pressable style={styles.deleteAction} onPress={() => confirmDelete(documentId)}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <IconSymbol name="xmark.circle.fill" size={28} color="#fff" />
        </Animated.View>
        <Animated.Text style={[styles.deleteActionText, { transform: [{ scale }] }]}>Delete</Animated.Text>
      </Pressable>
    );
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <Swipeable
      ref={(ref) => {
        swipeableRefs.current[item.documentId] = ref;
      }}
      renderRightActions={(prog, drag) => renderRightActions(prog, drag, item.documentId)}
      rightThreshold={60}
      overshootRight={false}
      friction={2}
    >
      <Pressable
        className="rounded-3xl p-4 mb-3"
        style={[styles.cardShadow, { backgroundColor: cardColor }]}
        onPress={() => handleNotificationPress(item)}
      >
        <HStack className="items-center">
          <Box
            className="w-12 h-12 rounded-full items-center justify-center mr-4"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <IconSymbol name={getIconForType(item.type)} size={24} color={primaryColor} />
          </Box>

          <VStack className="flex-1">
            <HStack className="items-center justify-between mb-1">
              <Text className="text-xs font-bold uppercase" style={{ color: primaryColor }}>
                {item.type.replace('_', ' ')}
              </Text>
              <Text className="text-xs" style={{ color: subtextColor }}>
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </Text>
            </HStack>
            <Text className="text-sm leading-6" style={{ color: textColor }}>
              {item.message}
            </Text>
          </VStack>

          {!item.read ? <Box className="w-2.5 h-2.5 rounded-full ml-3" style={{ backgroundColor: primaryColor }} /> : null}
        </HStack>
      </Pressable>
    </Swipeable>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerShown: true,
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor },
          headerTintColor: textColor,
          headerShadowVisible: false,
          headerRight: () =>
            notifications.length > 0 ? (
              <Pressable className="mr-1 px-2 py-1" onPress={() => setShowClearAllModal(true)}>
                <Text className="text-sm font-semibold" style={{ color: dangerColor }}>
                  Clear All
                </Text>
              </Pressable>
            ) : null,
        }}
      />

      {isLoading && !isRefetching ? (
        <Box className="flex-1 items-center justify-center">
          <Spinner size="large" color={primaryColor} />
        </Box>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.documentId}
          renderItem={renderItem}
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={primaryColor} colors={[primaryColor]} />
          }
          ListEmptyComponent={
            <Box className="flex-1 items-center justify-center pt-24 px-10">
              <IconSymbol name="bell.fill" size={64} color={subtextColor} />
              <Text className="text-2xl font-bold mt-4 text-center" style={{ color: textColor }}>
                No notifications yet
              </Text>
              <Text className="text-sm text-center mt-2 leading-6" style={{ color: subtextColor }}>
                We&apos;ll let you know when something important happens!
              </Text>
            </Box>
          }
        />
      )}

      <Modal visible={!!pendingDeleteId} transparent animationType="fade" onRequestClose={() => setPendingDeleteId(null)}>
        <Box style={styles.modalOverlay}>
          <Box className="w-full rounded-3xl p-7 items-center" style={[styles.cardShadow, { backgroundColor: cardColor }]}>
            <Box className="w-14 h-14 rounded-full items-center justify-center mb-4" style={{ backgroundColor: `${dangerColor}12` }}>
              <IconSymbol name="xmark.circle.fill" size={28} color={dangerColor} />
            </Box>
            <Text className="text-xl font-bold mb-2 text-center" style={{ color: textColor }}>
              Delete Notification?
            </Text>
            <Text className="text-sm text-center leading-6 mb-7" style={{ color: subtextColor }}>
              This notification will be permanently removed.
            </Text>
            <HStack className="w-full" space="sm">
              <Pressable
                className="flex-1 h-12 rounded-2xl items-center justify-center"
                style={{ borderColor, borderWidth: 1.5 }}
                onPress={() => {
                  if (pendingDeleteId) {
                    swipeableRefs.current[pendingDeleteId]?.close();
                  }
                  setPendingDeleteId(null);
                }}
              >
                <Text className="text-sm font-semibold" style={{ color: textColor }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 h-12 rounded-2xl items-center justify-center"
                style={{ backgroundColor: dangerColor }}
                onPress={handleConfirmSingleDelete}
              >
                {deleteMutation.isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-sm font-semibold text-white">Delete</Text>
                )}
              </Pressable>
            </HStack>
          </Box>
        </Box>
      </Modal>

      <Modal visible={showClearAllModal} transparent animationType="fade" onRequestClose={() => setShowClearAllModal(false)}>
        <Box style={styles.modalOverlay}>
          <Box className="w-full rounded-3xl p-7 items-center" style={[styles.cardShadow, { backgroundColor: cardColor }]}>
            <Box className="w-14 h-14 rounded-full items-center justify-center mb-4" style={{ backgroundColor: `${dangerColor}12` }}>
              <IconSymbol name="xmark.circle.fill" size={28} color={dangerColor} />
            </Box>
            <Text className="text-xl font-bold mb-2 text-center" style={{ color: textColor }}>
              Clear All Notifications?
            </Text>
            <Text className="text-sm text-center leading-6 mb-7" style={{ color: subtextColor }}>
              All {notifications.length} notification{notifications.length !== 1 ? 's' : ''} will be permanently deleted.
            </Text>
            <HStack className="w-full" space="sm">
              <Pressable
                className="flex-1 h-12 rounded-2xl items-center justify-center"
                style={{ borderColor, borderWidth: 1.5 }}
                onPress={() => setShowClearAllModal(false)}
              >
                <Text className="text-sm font-semibold" style={{ color: textColor }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 h-12 rounded-2xl items-center justify-center"
                style={{ backgroundColor: dangerColor }}
                onPress={() => {
                  setShowClearAllModal(false);
                  clearAllMutation.mutate();
                }}
              >
                {clearAllMutation.isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-sm font-semibold text-white">Clear All</Text>
                )}
              </Pressable>
            </HStack>
          </Box>
        </Box>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 16, paddingBottom: 40 },
  cardShadow: {
    shadowColor: '#2A120B',
    shadowOpacity: 0.05,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  deleteAction: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 24,
    marginBottom: 12,
    gap: 4,
  },
  deleteActionText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
});
