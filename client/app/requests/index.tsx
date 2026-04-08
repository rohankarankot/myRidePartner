import React from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { joinRequestService } from '@/services/join-request-service';
import { notificationService } from '@/services/notification-service';
import { JoinRequest } from '@/types/api';
import { useAuth } from '@/context/auth-context';
import { maskPhoneNumber } from '@/utils/phone';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { ListPageSkeleton } from '@/components/skeleton/page-skeletons';

export default function RequestsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const primaryColor = useThemeColor({}, 'primary');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  const { data: requests = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['pending-approvals', user?.id],
    queryFn: () => joinRequestService.getPendingRequestsForCaptain(user!.id),
    enabled: !!user?.id,
  });

  React.useEffect(() => {
    if (user?.id) {
      notificationService.markAllAsRead(user.id).then(() => {
        queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
      });
    }
  }, [queryClient, user?.id]);

  const renderItem = ({ item }: { item: JoinRequest }) => (
    <Pressable
      className="rounded-[24px] p-5 mb-4 shadow-sm"
      style={{ backgroundColor: cardColor }}
      onPress={() => router.push(`/requests/${item.documentId}`)}
    >
      <HStack className="items-center" space="md">
        <Box
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <Text className="text-lg font-extrabold" style={{ color: primaryColor }}>
            {item.passenger.username.charAt(0).toUpperCase()}
          </Text>
        </Box>

        <VStack className="flex-1" space="xs">
          <Text className="text-base font-bold" style={{ color: textColor }}>
            {item.passenger.username}
          </Text>
          <Text className="text-xs font-medium" style={{ color: subtextColor }}>
            Requested {item.requestedSeats} {item.requestedSeats === 1 ? 'seat' : 'seats'}
          </Text>
        </VStack>

        <IconSymbol name="chevron.right" size={18} color={subtextColor} />
      </HStack>

      <Box className="h-px w-full my-4" style={{ backgroundColor: borderColor }} />

      <HStack className="items-center" space="xs">
        <IconSymbol name="car.fill" size={14} color={subtextColor} />
        <Text className="text-xs font-medium flex-1" style={{ color: subtextColor }} numberOfLines={1}>
          {item.trip.startingPoint} → {item.trip.destination}
        </Text>
      </HStack>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Join Requests',
          headerTitleStyle: { fontWeight: '800' },
          headerStyle: { backgroundColor },
          headerTintColor: textColor,
          headerShadowVisible: false,
        }}
      />

      {isLoading && !isRefetching ? (
        <ListPageSkeleton />
      ) : (
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={primaryColor} />}
        ListEmptyComponent={
          <Box className="flex-1 items-center justify-center px-10 py-32">
            <VStack space="md" className="items-center">
              <Box className="w-16 h-16 rounded-full bg-gray-50 items-center justify-center">
                  <IconSymbol name="checkmark.circle.fill" size={32} color={subtextColor} />
              </Box>
              <Text className="text-xl font-extrabold text-center" style={{ color: textColor }}>
                No pending requests
              </Text>
              <Text className="text-sm text-center leading-6" style={{ color: subtextColor }}>
                When people request to join your rides, they will appear here.
              </Text>
            </VStack>
          </Box>
        }
      />
      )}
    </SafeAreaView>
  );
}
