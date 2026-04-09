import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';

import { useBottomSheetBackHandler } from '@/hooks/use-bottom-sheet-back-handler';
import { useThemeColor } from '@/hooks/use-theme-color';
import { userService } from '@/services/user-service';
import { useUserStore } from '@/store/user-store';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { Pressable } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
import { ListPageSkeleton } from '@/components/skeleton/page-skeletons';
import {
  CommunityCitiesEmptyState,
  CommunityCityOption,
  CommunityCitySheetHeader,
  CommunityMemberCard,
  CommunityMembersEmptyState,
  CommunityMembersListHeader,
} from '@/features/chats/components/community-members';

const PAGE_SIZE = 20;

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
  const [isCitySheetOpen, setIsCitySheetOpen] = useState(false);

  useBottomSheetBackHandler([{ isOpen: isCitySheetOpen, ref: citySheetRef }]);

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
          <CommunityMemberCard
            borderColor={borderColor}
            cardColor={cardColor}
            item={item}
            onPress={() => router.push(`/user/${item.id}`)}
            subtextColor={subtextColor}
            textColor={textColor}
          />
        )}
        ListHeaderComponent={
          <CommunityMembersListHeader
            activeCityLabel={activeCityLabel}
            primaryColor={primaryColor}
            subtextColor={subtextColor}
            textColor={textColor}
          />
        }
        ListEmptyComponent={
          <CommunityMembersEmptyState
            borderColor={borderColor}
            cardColor={cardColor}
            subtextColor={subtextColor}
            textColor={textColor}
          />
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
        onPress={() => {
          setIsCitySheetOpen(true);
          citySheetRef.current?.present();
        }}
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
        onDismiss={() => {
          setIsCitySheetOpen(false);
          setCitySearch('');
        }}
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
              <CommunityCityOption
                isActive={isActive}
                item={item}
                onPress={() => {
                  setSelectedCity(item === 'All cities' ? null : item);
                  setCitySearch('');
                  citySheetRef.current?.dismiss();
                }}
                primaryColor={primaryColor}
                subtextColor={subtextColor}
                textColor={textColor}
              />
            );
          }}
          ListEmptyComponent={
            <CommunityCitiesEmptyState
              borderColor={borderColor}
              subtextColor={subtextColor}
              textColor={textColor}
            />
          }
          contentContainerStyle={{ paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        />
      </BottomSheetModal>
    </SafeAreaView>
  );
}
