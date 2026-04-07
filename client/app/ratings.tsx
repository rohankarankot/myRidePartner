import React, { useCallback } from 'react';
import { FlatList } from 'react-native';
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
import { Divider } from '@/components/ui/divider';

const DUMMY_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';
const PAGE_SIZE = 10;

function StarRow({ stars }: { stars: number }) {
  return (
    <HStack space="xs" className="items-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <IconSymbol
          key={i}
          name={i <= stars ? 'star.fill' : 'star'}
          size={12}
          color={i <= stars ? '#F59E0B' : '#E5E7EB'}
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
    <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: isCurrentUser ? 'My Ratings' : 'Ratings & Reviews',
          headerTitleStyle: { fontWeight: '800' },
          headerShown: true,
          headerStyle: { backgroundColor },
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
        <VStack className="flex-1 items-center justify-center p-8" space="lg">
          <Box className="w-16 h-16 rounded-full bg-red-50 items-center justify-center">
            <IconSymbol name="exclamationmark.triangle.fill" size={32} color="#EF4444" />
          </Box>
          <Text className="text-base text-center font-bold" style={{ color: textColor }}>
            Failed to load ratings
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="px-8 py-3 rounded-2xl"
            style={{ backgroundColor: primaryColor }}
          >
            <Text className="font-extrabold text-white uppercase tracking-widest text-xs">Retry</Text>
          </Pressable>
        </VStack>
      ) : ratings.length === 0 ? (
        <VStack className="flex-1 items-center justify-center p-12" space="md">
          <Box className="w-20 h-20 rounded-full bg-gray-50 items-center justify-center mb-2">
            <IconSymbol name="star.fill" size={40} color={borderColor} />
          </Box>
          <Text className="text-2xl font-extrabold text-center" style={{ color: textColor }}>
            No Ratings Yet
          </Text>
          <Text className="text-sm text-center leading-6" style={{ color: subtextColor }}>
            {isCurrentUser
              ? 'Your ratings from passengers will appear here after completed trips.'
              : 'This user has not received any ratings yet.'}
          </Text>
        </VStack>
      ) : (
        <FlatList
          data={ratings}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          ListHeaderComponent={
            <Text className="text-[10px] font-extrabold uppercase tracking-widest mb-4" style={{ color: subtextColor }}>
              {totalCount} rating{totalCount !== 1 ? 's' : ''} received
            </Text>
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <Box className="py-8 items-center">
                <Spinner color={primaryColor} size="small" />
              </Box>
            ) : !hasNextPage && ratings.length > 0 ? (
              <Box className="py-12 items-center">
                <Divider className="w-12 mb-4" style={{ backgroundColor: borderColor }} />
                <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
                  End of ratings
                </Text>
              </Box>
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
              <Box className="rounded-[28px] p-5 mb-4 shadow-sm border" style={{ backgroundColor: cardColor, borderColor }}>
                <HStack className="items-start" space="md">
                  <Avatar size="md" className="border shadow-sm" style={{ borderColor }}>
                    <AvatarFallbackText>{raterName}</AvatarFallbackText>
                    {raterAvatar && <AvatarImage source={{ uri: raterAvatar }} alt={raterName} />}
                  </Avatar>
                  <VStack className="flex-1" space="xs">
                    <HStack className="justify-between items-start">
                        <VStack space="xs">
                            <Text className="text-base font-bold" style={{ color: textColor }}>
                            {raterName}
                            </Text>
                            <StarRow stars={item.stars} />
                        </VStack>
                        <Text className="text-[10px] font-bold" style={{ color: subtextColor }}>
                            {ratingDate}
                        </Text>
                    </HStack>

                    {item.comment ? (
                    <Box className="mt-3 p-3 rounded-2xl" style={{ backgroundColor: `${subtextColor}05` }}>
                        <Text className="text-sm font-medium italic leading-6" style={{ color: textColor }}>
                            &quot;{item.comment}&quot;
                        </Text>
                    </Box>
                    ) : null}

                    {tripRoute ? (
                    <HStack
                        className="self-start items-center mt-3 px-3 py-1 rounded-full border"
                        style={{ backgroundColor: `${primaryColor}05`, borderColor: `${primaryColor}20` }}
                        space="xs"
                    >
                        <IconSymbol name="car.fill" size={10} color={primaryColor} />
                        <Text className="text-[10px] font-extrabold uppercase tracking-tight" style={{ color: primaryColor }} numberOfLines={1}>
                        {tripRoute}
                        </Text>
                    </HStack>
                    ) : null}
                  </VStack>
                </HStack>
              </Box>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
