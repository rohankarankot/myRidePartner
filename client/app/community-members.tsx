import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

import { useThemeColor } from '@/hooks/use-theme-color';
import { userService } from '@/services/user-service';
import { CommunityMember } from '@/types/api';
import { useUserStore } from '@/store/user-store';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Spinner } from '@/components/ui/spinner';
import { Divider } from '@/components/ui/divider';
import { ListPageSkeleton } from '@/components/skeleton/page-skeletons';

const PAGE_SIZE = 20;

const CommunityCitySheetHeader = React.memo(
  ({
    citySearch,
    setCitySearch,
    textColor,
    subtextColor,
    borderColor,
    cardColor,
  }: {
    citySearch: string;
    setCitySearch: (value: string) => void;
    textColor: string;
    subtextColor: string;
    borderColor: string;
    cardColor: string;
  }) => (
    <VStack className="px-6 py-5" space="md">
        <VStack space="xs">
            <Text className="text-2xl font-extrabold" style={{ color: textColor }}>Select City</Text>
            <Text className="text-xs font-medium" style={{ color: subtextColor }}>
            Filter community members by city
            </Text>
        </VStack>
        <Box className="h-14 rounded-[24px] flex-row items-center px-4 border-2 shadow-sm" style={{ backgroundColor: cardColor, borderColor }}>
            <IconSymbol name="magnifyingglass" size={16} color={subtextColor} />
            <BottomSheetTextInput
                placeholder="Search city..."
                placeholderTextColor={subtextColor}
                style={{ flex: 1, marginLeft: 12, fontSize: 15, color: textColor }}
                value={citySearch}
                onChangeText={setCitySearch}
                autoCorrect={false}
                autoCapitalize="words"
            />
        </Box>
    </VStack>
  )
);

CommunityCitySheetHeader.displayName = 'CommunityCitySheetHeader';

export default function CommunityMembersScreen() {
  const { city } = useLocalSearchParams<{ city?: string }>();
  const router = useRouter();
  const { profile } = useUserStore();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const citySheetRef = useRef<BottomSheetModal>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(city || profile?.city || null);
  const [citySearch, setCitySearch] = useState('');

  const { data: cities = [] } = useQuery({
    queryKey: ['community-member-cities'],
    queryFn: () => userService.getCommunityMemberCities(),
  });

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['community-members', selectedCity],
    queryFn: ({ pageParam }) =>
      userService.getCommunityMembers({
        page: pageParam,
        pageSize: PAGE_SIZE,
        city: selectedCity || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pageCount } = lastPage.meta.pagination;
      return page < pageCount ? page + 1 : undefined;
    },
  });

  const members = data?.pages.flatMap((page) => page.data) ?? [];
  const cityFilters = useMemo(() => ['All cities', ...cities], [cities]);
  const activeCityLabel = selectedCity || 'All cities';
  const filteredCities = useMemo(
    () => cityFilters.filter((entry) => entry.toLowerCase().includes(citySearch.toLowerCase())),
    [cityFilters, citySearch]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  if (isLoading) {
    return <ListPageSkeleton />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Members',
          headerTitleStyle: { fontWeight: '800' },
          headerShown: true,
          headerStyle: { backgroundColor },
          headerTintColor: textColor,
          headerShadowVisible: false,
        }}
      />

      <FlatList
        data={members}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 20 }}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
          }
        }}
        renderItem={({ item }) => (
          <Pressable
            className="rounded-[28px] border p-4 mb-3 shadow-sm"
            style={{ backgroundColor: cardColor, borderColor }}
            onPress={() => router.push(`/user/${item.id}`)}
          >
            <HStack className="items-center" space="md">
              <Avatar size="md" className="border shadow-sm" style={{ borderColor }}>
                <AvatarFallbackText>{getMemberName(item)}</AvatarFallbackText>
                {getAvatarUrl(item) ? (
                  <AvatarImage source={{ uri: getAvatarUrl(item)! }} alt={getMemberName(item)} />
                ) : null}
              </Avatar>
              <VStack className="flex-1" space="xs">
                <Text className="text-base font-bold" style={{ color: textColor }} numberOfLines={1}>
                  {getMemberName(item)}
                </Text>
                <Text className="text-xs font-medium" style={{ color: subtextColor }} numberOfLines={1}>
                  {item.userProfile?.city || item.email}
                </Text>
              </VStack>
            </HStack>
          </Pressable>
        )}
        ListHeaderComponent={
          <VStack className="mb-6" space="md">
            <VStack space="xs">
                <Text className="text-3xl font-extrabold" style={{ color: textColor }}>
                Members
                </Text>
                <Text className="text-sm font-medium leading-5" style={{ color: subtextColor }}>
                Connect with travelers from your city and beyond.
                </Text>
            </VStack>
            <HStack className="items-center" space="sm">
              <Box
                className="rounded-full px-4 py-1.5 items-center justify-center border"
                style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}20` }}
              >
                <HStack space="xs" className="items-center">
                    <IconSymbol name="mappin.circle.fill" size={12} color={primaryColor} />
                    <Text className="text-xs font-bold leading-none" style={{ color: primaryColor }} numberOfLines={1}>
                        {activeCityLabel}
                    </Text>
                </HStack>
              </Box>
            </HStack>
          </VStack>
        }
        ListEmptyComponent={
          <VStack className="rounded-[32px] border items-center px-8 py-12 mt-4" style={{ backgroundColor: cardColor, borderColor }} space="md">
            <Box className="w-16 h-16 rounded-full bg-gray-50 items-center justify-center">
                <IconSymbol name="person.crop.circle.badge.exclamationmark" size={32} color={subtextColor} />
            </Box>
            <Text className="text-xl font-extrabold text-center" style={{ color: textColor }}>
              No members found
            </Text>
            <Text className="text-sm text-center leading-6" style={{ color: subtextColor }}>
              Try another city filter to see more community members.
            </Text>
          </VStack>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <Box className="py-8 items-center">
              <Spinner color={primaryColor} size="small" />
            </Box>
          ) : null
        }
      />

      <Pressable
        onPress={() => citySheetRef.current?.present()}
        className="absolute right-6 bottom-8 h-16 w-16 rounded-full items-center justify-center shadow-xl"
        style={{ backgroundColor: primaryColor }}
      >
        <IconSymbol name="slider.horizontal.3" size={24} color="#FFFFFF" />
      </Pressable>

      <BottomSheetModal
        ref={citySheetRef}
        snapPoints={['80%']}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: cardColor, borderRadius: 32 }}
        handleIndicatorStyle={{ backgroundColor: borderColor, width: 40 }}
        enablePanDownToClose
        keyboardBehavior="fillParent"
        keyboardBlurBehavior="restore"
        onDismiss={() => setCitySearch('')}
      >
        <BottomSheetFlatList
          data={filteredCities}
          keyExtractor={(item: string) => item}
          ListHeaderComponent={
            <CommunityCitySheetHeader
              citySearch={citySearch}
              setCitySearch={setCitySearch}
              textColor={textColor}
              subtextColor={subtextColor}
              borderColor={borderColor}
              cardColor={cardColor}
            />
          }
          renderItem={({ item }: { item: string }) => {
            const isActive = item === 'All cities' ? selectedCity === null : selectedCity === item;

            return (
              <Pressable
                className="mx-6 mb-2 rounded-2xl p-4 border"
                style={{
                  backgroundColor: isActive ? `${primaryColor}05` : 'transparent',
                  borderColor: isActive ? primaryColor : 'transparent',
                }}
                onPress={() => {
                  setSelectedCity(item === 'All cities' ? null : item);
                  setCitySearch('');
                  citySheetRef.current?.dismiss();
                }}
              >
                <HStack className="items-center" space="md">
                  <Box
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: isActive ? primaryColor : `${subtextColor}10` }}
                  >
                    <IconSymbol
                      name={item === 'All cities' ? 'globe' : 'mappin.circle.fill'}
                      size={18}
                      color={isActive ? '#FFFFFF' : subtextColor}
                    />
                  </Box>
                  <Text
                    className="flex-1 text-base font-bold"
                    style={{ color: isActive ? primaryColor : textColor }}
                  >
                    {item}
                  </Text>
                  {isActive && (
                    <Box className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: primaryColor }}>
                        <IconSymbol name="checkmark" size={12} color="#FFFFFF" />
                    </Box>
                  )}
                </HStack>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <VStack className="items-center px-12 py-16" space="md">
                <IconSymbol name="magnifyingglass" size={40} color={borderColor} />
              <Text className="text-lg font-bold text-center" style={{ color: textColor }}>No matching cities</Text>
              <Text className="text-sm text-center" style={{ color: subtextColor }}>
                Try a different search keyword.
              </Text>
            </VStack>
          }
          contentContainerStyle={{ paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        />
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const getMemberName = (member: CommunityMember) =>
  member.userProfile?.fullName || member.username || 'Member';

const getAvatarUrl = (member: CommunityMember) =>
  typeof member.userProfile?.avatar === 'string'
    ? member.userProfile.avatar
    : member.userProfile?.avatar?.url;
