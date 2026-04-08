import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Modal, RefreshControl } from 'react-native';
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
import { Divider } from '@/components/ui/divider';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { ListPageSkeleton } from '@/components/skeleton/page-skeletons';

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

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    _drag: Animated.AnimatedInterpolation<number>,
    documentId: string
  ) => {
    const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1], extrapolate: 'clamp' });
    return (
      <Pressable 
        style={{ backgroundColor: '#EF4444', width: 80, borderRadius: 28, marginBottom: 12, justifyContent: 'center', alignItems: 'center' }} 
        onPress={() => confirmDelete(documentId)}
      >
        <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
          <IconSymbol name="trash.fill" size={24} color="#fff" />
          <Text className="text-[10px] font-extrabold uppercase mt-1 text-white">Delete</Text>
        </Animated.View>
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
        className="rounded-[32px] p-5 mb-3 border shadow-sm"
        style={{ backgroundColor: cardColor, borderColor }}
        onPress={() => handleNotificationPress(item)}
      >
        <HStack className="items-start" space="md">
          <Box
            className="w-12 h-12 rounded-2xl items-center justify-center border shadow-sm"
            style={{ backgroundColor: `${primaryColor}10`, borderColor: primaryColor + '20' }}
          >
            <IconSymbol name={getIconForType(item.type)} size={20} color={primaryColor} />
          </Box>

          <VStack className="flex-1">
            <HStack className="items-center justify-between mb-2">
              <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
                {item.type.replace('_', ' ')}
              </Text>
              <Text className="text-[9px] font-bold uppercase" style={{ color: subtextColor }}>
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </Text>
            </HStack>
            <Text className="text-sm font-medium leading-6" style={{ color: textColor }}>
              {item.message}
            </Text>
          </VStack>

          {!item.read && (
            <Box className="w-2.5 h-2.5 rounded-full mt-1.5 shadow-sm border-2" style={{ backgroundColor: primaryColor, borderColor: '#fff' }} />
          )}
        </HStack>
      </Pressable>
    </Swipeable>
  );

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
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={primaryColor} colors={[primaryColor]} />
          }
          ListEmptyComponent={
            <VStack className="items-center justify-center pt-24 px-10" space="lg">
                <Box className="w-20 h-20 rounded-[32px] bg-gray-50 items-center justify-center rotate-3 shadow-xl">
                    <IconSymbol name="bell.slash.fill" size={34} color={subtextColor} />
                </Box>
                <VStack className="items-center" space="xs">
                    <Text className="text-2xl font-extrabold text-center" style={{ color: textColor }}>
                        Quiet in here
                    </Text>
                    <Text className="text-sm font-medium text-center leading-6" style={{ color: subtextColor }}>
                        We&apos;ll ping you here when your ride requests are approved or when new trips match your route.
                    </Text>
                </VStack>
            </VStack>
          }
        />
      )}

      {/* Single Delete Confirmation Modal */}
      <Modal visible={!!pendingDeleteId} transparent animationType="fade" onRequestClose={() => setPendingDeleteId(null)}>
        <Box className="flex-1 bg-black/60 justify-center items-center px-6">
          <Box className="w-full rounded-[32px] p-8 items-center border-2 border-white shadow-2xl" style={{ backgroundColor: cardColor }}>
            <Box className="w-16 h-16 rounded-full items-center justify-center mb-6 border-4" style={{ backgroundColor: `${dangerColor}10`, borderColor: dangerColor + '20' }}>
              <IconSymbol name="trash.fill" size={32} color={dangerColor} />
            </Box>
            <Text className="text-2xl font-extrabold mb-2 text-center" style={{ color: textColor }}>
              Permanently Delete?
            </Text>
            <Text className="text-sm font-medium text-center leading-6 mb-8" style={{ color: subtextColor }}>
              This update will be removed from your activity log forever.
            </Text>
            <HStack className="w-full" space="md">
              <Button
                className="flex-1 h-14 rounded-2xl border-2 shadow-sm"
                variant="outline"
                style={{ borderColor }}
                onPress={() => {
                  if (pendingDeleteId) {
                    swipeableRefs.current[pendingDeleteId]?.close();
                  }
                  setPendingDeleteId(null);
                }}
              >
                <ButtonText className="text-xs font-extrabold uppercase tracking-widest" style={{ color: textColor }}>Cancel</ButtonText>
              </Button>
              <Button
                className="flex-1 h-14 rounded-2xl shadow-lg"
                style={{ backgroundColor: dangerColor }}
                onPress={handleConfirmSingleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <Spinner color="#fff" size="small" />
                ) : (
                    <HStack space="xs" className="items-center">
                        <ButtonText className="text-xs font-extrabold uppercase tracking-widest text-white">Delete</ButtonText>
                        <IconSymbol name="trash.fill" size={12} color="white" />
                    </HStack>
                )}
              </Button>
            </HStack>
          </Box>
        </Box>
      </Modal>

      {/* Clear All Confirmation Modal */}
      <Modal visible={showClearAllModal} transparent animationType="fade" onRequestClose={() => setShowClearAllModal(false)}>
        <Box className="flex-1 bg-black/60 justify-center items-center px-6">
          <Box className="w-full rounded-[32px] p-8 items-center border-2 border-white shadow-2xl" style={{ backgroundColor: cardColor }}>
            <Box className="w-16 h-16 rounded-full items-center justify-center mb-6 border-4" style={{ backgroundColor: `${dangerColor}10`, borderColor: dangerColor + '20' }}>
              <IconSymbol name="bell.slash.fill" size={32} color={dangerColor} />
            </Box>
            <Text className="text-2xl font-extrabold mb-2 text-center" style={{ color: textColor }}>
              Purge Inbox?
            </Text>
            <Text className="text-sm font-medium text-center leading-6 mb-8" style={{ color: subtextColor }}>
              You are about to delete all {notifications.length} notifications. This action cannot be undone.
            </Text>
            <HStack className="w-full" space="md">
              <Button
                className="flex-1 h-14 rounded-2xl border-2 shadow-sm"
                variant="outline"
                style={{ borderColor }}
                onPress={() => setShowClearAllModal(false)}
              >
                <ButtonText className="text-xs font-extrabold uppercase tracking-widest" style={{ color: textColor }}>Wait, Go Back</ButtonText>
              </Button>
              <Button
                className="flex-1 h-14 rounded-2xl shadow-lg"
                style={{ backgroundColor: dangerColor }}
                onPress={() => {
                  setShowClearAllModal(false);
                  clearAllMutation.mutate();
                }}
                disabled={clearAllMutation.isPending}
              >
                {clearAllMutation.isPending ? (
                  <Spinner color="#fff" size="small" />
                ) : (
                    <HStack space="xs" className="items-center">
                        <ButtonText className="text-xs font-extrabold uppercase tracking-widest text-white">Clear All</ButtonText>
                        <IconSymbol name="trash.fill" size={12} color="white" />
                    </HStack>
                )}
              </Button>
            </HStack>
          </Box>
        </Box>
      </Modal>
    </SafeAreaView>
  );
}
