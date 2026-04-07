import React, { useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';

import { ratingService } from '@/services/rating-service';
import { useAuth } from '@/context/auth-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';

const DUMMY_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';
const PAGE_SIZE = 10;

function StarRow({ stars }: { stars: number }) {
  return (
    <HStack style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <IconSymbol
          key={i}
          name={i <= stars ? 'star.fill' : 'star'}
          size={14}
          color={i <= stars ? '#F59E0B' : '#D1D5DB'}
        />
      ))}
    </HStack>
  );
}

export default function RatingsScreen() {
  const { user } = useAuth();
  const { userId } = useLocalSearchParams();

  const targetUserId = userId ? Number(userId) : user?.id;
  const isCurrentUser = targetUserId === user?.id;

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['ratings', 'user', targetUserId],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      ratingService.getRatingsByUser(targetUserId!, pageParam, PAGE_SIZE),
    getNextPageParam: (lastPage: any) => {
      const pagination = lastPage?.meta?.pagination;
      if (!pagination) return undefined;
      return pagination.page < pagination.pageCount ? pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!targetUserId,
  });

  const ratings = data?.pages.flatMap((page) => page.data) ?? [];
  const totalCount = data?.pages[0]?.meta?.pagination?.total ?? 0;

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: isCurrentUser ? 'My Ratings' : 'Ratings & Reviews',
          headerShown: true,
          headerStyle: { backgroundColor: cardColor },
          headerTintColor: textColor,
          headerShadowVisible: false,
          headerBackTitle: 'Profile',
        }}
      />

      {isLoading ? (
        <Box className="flex-1 items-center justify-center p-8">
          <Spinner size="large" color={primaryColor} />
        </Box>
      ) : error ? (
        <Box className="flex-1 items-center justify-center p-8">
          <Text className="text-sm text-center" style={{ color: subtextColor }}>
            Failed to load ratings
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="px-5 py-2.5 rounded-2xl mt-2"
            style={{ backgroundColor: primaryColor }}
          >
            <Text className="font-semibold text-white">Retry</Text>
          </Pressable>
        </Box>
      ) : ratings.length === 0 ? (
        <Box className="flex-1 items-center justify-center p-8">
          <IconSymbol name="star" size={48} color={borderColor} />
          <Text className="text-xl font-bold mt-2" style={{ color: textColor }}>
            No Ratings Yet
          </Text>
          <Text className="text-sm text-center leading-6 mt-1" style={{ color: subtextColor }}>
            {isCurrentUser
              ? 'Your ratings from passengers will appear here after completed trips.'
              : 'This user has not received any ratings yet.'}
          </Text>
        </Box>
      ) : (
        <FlatList
          data={ratings}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Text className="text-sm mb-3" style={{ color: subtextColor }}>
              {totalCount} rating{totalCount !== 1 ? 's' : ''} received
            </Text>
          }
          ItemSeparatorComponent={() => <Box style={styles.gap} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <Box style={styles.footer}>
                <Spinner color={primaryColor} size="small" />
              </Box>
            ) : !hasNextPage && ratings.length > 0 ? (
              <Text style={[styles.footerText, { color: subtextColor }]}>All ratings loaded</Text>
            ) : null
          }
          renderItem={({ item }) => {
            const raterAvatar = item.rater?.userProfile?.avatar;
            const raterName = item.rater?.userProfile?.fullName || item.rater?.username || 'Unknown';
            const tripRoute = item.trip
              ? `${item.trip.startingPoint} → ${item.trip.destination}`
              : null;
            const ratingDate = new Date(item.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <Box className="rounded-3xl p-4" style={[styles.cardShadow, { backgroundColor: cardColor }]}>
                <HStack className="items-center">
                  <Avatar size="md">
                    <AvatarFallbackText>{raterName}</AvatarFallbackText>
                    <AvatarImage source={{ uri: raterAvatar || DUMMY_AVATAR }} alt={raterName} />
                  </Avatar>
                  <VStack className="flex-1 ml-3" space="xs">
                    <Text className="text-base font-semibold" style={{ color: textColor }}>
                      {raterName}
                    </Text>
                    <StarRow stars={item.stars} />
                  </VStack>
                  <Text className="text-xs" style={{ color: subtextColor }}>
                    {ratingDate}
                  </Text>
                </HStack>

                {item.comment ? (
                  <Text className="text-sm italic leading-6 mt-3" style={{ color: textColor }}>
                    &quot;{item.comment}&quot;
                  </Text>
                ) : null}

                {tripRoute ? (
                  <HStack
                    className="self-start items-center mt-3 px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: `${primaryColor}12` }}
                    space="xs"
                  >
                    <IconSymbol name="car.fill" size={12} color={primaryColor} />
                    <Text className="text-xs font-semibold" style={{ color: primaryColor }} numberOfLines={1}>
                      {tripRoute}
                    </Text>
                  </HStack>
                ) : null}
              </Box>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: 16, paddingBottom: 32 },
  gap: { height: 12 },
  footer: { paddingVertical: 20, alignItems: 'center' },
  footerText: { textAlign: 'center', fontSize: 12, paddingVertical: 20 },
  cardShadow: {
    shadowColor: '#2A120B',
    shadowOpacity: 0.05,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  starRow: { flexDirection: 'row', gap: 2 },
});
