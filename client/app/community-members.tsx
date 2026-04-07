import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text as RNText, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

import { AppLoader } from '@/components/app-loader';
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

const PAGE_SIZE = 20;

const CommunityCitySheetHeader = React.memo(
  ({
    citySearch,
    setCitySearch,
    textColor,
    subtextColor,
  }: {
    citySearch: string;
    setCitySearch: (value: string) => void;
    textColor: string;
    subtextColor: string;
  }) => (
    <View style={styles.sheetHeader}>
      <View style={styles.sheetHeaderCopy}>
        <RNText style={[styles.sheetTitle, { color: textColor }]}>Select City</RNText>
        <RNText style={[styles.sheetSubtitle, { color: subtextColor }]}>
          Filter community members by city
        </RNText>
      </View>
      <View style={[styles.sheetSearchBox, { backgroundColor: `${subtextColor}10` }]}>
        <IconSymbol name="magnifyingglass" size={18} color={subtextColor} />
        <BottomSheetTextInput
          placeholder="Search city..."
          placeholderTextColor={subtextColor}
          style={[styles.sheetSearchInput, { color: textColor }]}
          value={citySearch}
          onChangeText={setCitySearch}
          autoCorrect={false}
          autoCapitalize="words"
        />
      </View>
    </View>
  )
);

CommunityCitySheetHeader.displayName = 'CommunityCitySheetHeader';

export default function CommunityMembersScreen() {
  const { city } = useLocalSearchParams<{ city?: string }>();
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
    return (
      <View style={[styles.center, { backgroundColor }]}>
        <AppLoader />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Members',
          headerShown: true,
          headerStyle: { backgroundColor },
          headerTintColor: textColor,
          headerShadowVisible: false,
        }}
      />

      <FlatList
        data={members}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.container}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
          }
        }}
        renderItem={({ item }) => (
          <Box className="rounded-2xl border p-[14px]" style={{ backgroundColor: cardColor, borderColor }}>
            <HStack className="items-center" space="md">
              <Avatar size="md">
                <AvatarFallbackText>{getMemberName(item)}</AvatarFallbackText>
                {getAvatarUrl(item) ? (
                  <AvatarImage source={{ uri: getAvatarUrl(item)! }} alt={getMemberName(item)} />
                ) : null}
              </Avatar>
              <VStack className="flex-1" space="xs">
                <Text className="text-base font-bold" style={{ color: textColor }} numberOfLines={1}>
                  {getMemberName(item)}
                </Text>
                <Text className="text-sm" style={{ color: subtextColor }} numberOfLines={1}>
                  {item.userProfile?.city || item.email}
                </Text>
              </VStack>
            </HStack>
          </Box>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          <VStack className="mb-2" space="sm">
            <Text className="text-2xl font-bold" style={{ color: textColor }}>
              Community members
            </Text>
            <Text className="text-sm leading-5" style={{ color: subtextColor }}>
              Members are filtered city-wise, and users without an updated city are hidden.
            </Text>
            <HStack className="items-center" space="sm">
              <Text className="text-xs font-semibold" style={{ color: subtextColor }}>
                Current city filter
              </Text>
              <Box
                className="max-w-[220px] min-h-7 rounded-full px-3 items-center justify-center"
                style={{ backgroundColor: `${primaryColor}14` }}
              >
                <Text className="text-xs font-bold" style={{ color: primaryColor }} numberOfLines={1}>
                  {activeCityLabel}
                </Text>
              </Box>
            </HStack>
          </VStack>
        }
        ListEmptyComponent={
          <Box className="rounded-3xl border items-center px-[18px] py-5 mt-1" style={{ backgroundColor: cardColor, borderColor }}>
            <Text className="text-base font-bold mb-1" style={{ color: textColor }}>
              No members found
            </Text>
            <Text className="text-sm leading-5 text-center" style={{ color: subtextColor }}>
              Try another city filter to see more community members.
            </Text>
          </Box>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footerLoader}>
              <AppLoader />
            </View>
          ) : null
        }
      />

      <Pressable
        onPress={() => citySheetRef.current?.present()}
        className="absolute right-[18px] bottom-6 h-[58px] w-[58px] rounded-full items-center justify-center"
        style={[styles.floatingFilterButton, { backgroundColor: primaryColor }]}
      >
        <IconSymbol name="slider.horizontal.3" size={20} color="#FFFFFF" />
      </Pressable>

      <BottomSheetModal
        ref={citySheetRef}
        snapPoints={['78%']}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: cardColor }}
        handleIndicatorStyle={{ backgroundColor: subtextColor }}
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
            />
          }
          renderItem={({ item }: { item: string }) => {
            const isActive = item === 'All cities' ? selectedCity === null : selectedCity === item;

            return (
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.cityRow,
                  {
                    backgroundColor: isActive ? `${primaryColor}10` : 'transparent',
                    borderColor: isActive ? primaryColor : 'transparent',
                  },
                ]}
                onPress={() => {
                  setSelectedCity(item === 'All cities' ? null : item);
                  setCitySearch('');
                  citySheetRef.current?.dismiss();
                }}
              >
                <View style={styles.cityRowLeft}>
                  <View
                    style={[
                      styles.cityRowIcon,
                      { backgroundColor: isActive ? primaryColor : `${subtextColor}15` },
                    ]}
                  >
                    <IconSymbol
                      name={item === 'All cities' ? 'globe' : 'mappin.circle.fill'}
                      size={20}
                      color={isActive ? '#FFFFFF' : subtextColor}
                    />
                  </View>
                  <View style={styles.cityRowCopy}>
                    <RNText
                      style={[styles.cityRowTitle, { color: isActive ? primaryColor : textColor }]}
                    >
                      {item}
                    </RNText>
                  </View>
                </View>
                {isActive ? (
                  <View style={[styles.cityRowCheck, { backgroundColor: primaryColor }]}>
                    <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <BottomSheetView style={styles.sheetEmptyState}>
              <RNText style={[styles.sheetEmptyTitle, { color: textColor }]}>No matching city</RNText>
              <RNText style={[styles.sheetEmptySubtitle, { color: subtextColor }]}>
                Try a different search keyword.
              </RNText>
            </BottomSheetView>
          }
          contentContainerStyle={styles.sheetListContent}
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 16,
  },
  footerLoader: {
    paddingVertical: 16,
  },
  floatingFilterButton: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  sheetHeader: {
    padding: 24,
    paddingBottom: 16,
  },
  sheetHeaderCopy: {
    marginBottom: 18,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 14,
  },
  sheetSearchBox: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  sheetSearchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },
  sheetListContent: {
    paddingBottom: 40,
  },
  cityRow: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginBottom: 10,
    marginHorizontal: 20,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  cityRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  cityRowIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityRowCopy: {
    flex: 1,
  },
  cityRowTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cityRowCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetEmptyState: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  sheetEmptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  sheetEmptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
});
