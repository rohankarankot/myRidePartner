import React from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
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
import { Spinner } from '@/components/ui/spinner';

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
      className="rounded-3xl p-4 mb-4"
      style={[styles.cardShadow, { backgroundColor: cardColor }]}
      onPress={() => router.push(`/requests/${item.documentId}`)}
    >
      <HStack className="items-center">
        <Box
          className="w-[50px] h-[50px] rounded-full items-center justify-center"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <Text className="text-xl font-bold" style={{ color: primaryColor }}>
            {item.passenger.username.charAt(0).toUpperCase()}
          </Text>
        </Box>

        <VStack className="flex-1 ml-3" space="xs">
          <Text className="text-lg font-semibold" style={{ color: textColor }}>
            {item.passenger.username}
          </Text>
          <Text className="text-sm" style={{ color: subtextColor }} numberOfLines={1}>
            Requested {item.requestedSeats} {item.requestedSeats === 1 ? 'seat' : 'seats'}
          </Text>
          <Text className="text-sm" style={{ color: subtextColor }} numberOfLines={1}>
            {item.sharePhoneNumber
              ? item.passenger.userProfile?.phoneNumber || 'Phone unavailable'
              : maskPhoneNumber(item.passenger.userProfile?.phoneNumber)}
          </Text>
        </VStack>

        <IconSymbol name="chevron.right" size={20} color={subtextColor} />
      </HStack>

      <Box className="h-px my-3" style={{ backgroundColor: borderColor }} />

      <HStack className="items-center" space="sm">
        <IconSymbol name="car" size={16} color={subtextColor} />
        <Text className="text-sm flex-1" style={{ color: subtextColor }} numberOfLines={1}>
          {item.trip.startingPoint} → {item.trip.destination}
        </Text>
      </HStack>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Join Requests',
          headerShown: true,
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor },
          headerTintColor: textColor,
          headerShadowVisible: false,
        }}
      />

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          <Box className="flex-1 items-center justify-center px-10 py-24">
            {isLoading ? (
              <Spinner size="large" color={primaryColor} />
            ) : (
              <>
                <IconSymbol name="checkmark.circle" size={60} color={subtextColor} />
                <Text className="text-xl font-bold mt-4 text-center" style={{ color: textColor }}>
                  No pending requests
                </Text>
                <Text className="text-sm text-center mt-2 leading-6" style={{ color: subtextColor }}>
                  When people request to join your rides, they will appear here.
                </Text>
              </>
            )}
          </Box>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  cardShadow: {
    shadowColor: '#2A120B',
    shadowOpacity: 0.05,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  container: {
    padding: 20,
  },
});
