import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FlatList, RefreshControl, TextInput as RNTextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { tripService } from '@/services/trip-service';
import { Trip, GenderPreference } from '@/types/api';
import { useRouter, useNavigation, Tabs } from 'expo-router';
import { isToday, isTomorrow, format } from 'date-fns';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import { useUserStore } from '@/store/user-store';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetTextInput, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { CITIES } from '@/constants/cities';
import { FilterBottomSheet } from '@/components/FilterBottomSheet';
import { notificationService } from '@/services/notification-service';
import { useScrollToTop } from '@react-navigation/native';
import { DiscoveryBannerAd } from '@/features/ads/components/discovery-banner-ad';
import { useBlockedUsers } from '@/features/safety/hooks/use-blocked-users';
import { FindRidesSkeleton } from '@/features/trips/components/FindRidesSkeleton';

import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Divider } from '@/components/ui/divider';
import { Button, ButtonText } from '@/components/ui/button';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { Input, InputField } from '@/components/ui/input';

const LAST_SELECTED_CITY_KEY = 'find_rides_last_selected_city';

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return '';
  const tripDate = new Date(dateStr);
  if (isToday(tripDate)) return 'Today';
  if (isTomorrow(tripDate)) return 'Tomorrow';
  return format(tripDate, 'MMM d');
};

const CitySheetHeader = React.memo(({ citySearch, setCitySearch, textColor, subtextColor, borderColor }: {
  citySearch: string;
  setCitySearch: (v: string) => void;
  textColor: string;
  subtextColor: string;
  borderColor: string;
}) => (
  <VStack className="px-6 py-5" space="md">
    <VStack space="xs">
      <Text className="text-2xl font-extrabold" style={{ color: textColor }}>Select City</Text>
      <Text className="text-xs font-medium" style={{ color: subtextColor }}>Choose your city to find nearby rides</Text>
    </VStack>
    <Box className="h-12 rounded-2xl flex-row items-center px-4 border" style={{ backgroundColor: `${subtextColor}05`, borderColor }}>
      <IconSymbol name="magnifyingglass" size={16} color={subtextColor} />
      <BottomSheetTextInput
        placeholder="Search your city..."
        placeholderTextColor={subtextColor}
        style={{ flex: 1, marginLeft: 10, color: textColor, fontSize: 14 }}
        value={citySearch}
        onChangeText={setCitySearch}
        autoCorrect={false}
        autoCapitalize="words"
      />
    </Box>
  </VStack>
));
CitySheetHeader.displayName = 'CitySheetHeader';

const TripCard = ({ documentId, from, to, date, time, price, isCalculated, status, genderPreference, avatarUrl, captainName, onPress }: {
  documentId: string,
  from: string,
  to: string,
  date: string,
  time: string,
  price: string | undefined,
  isCalculated: boolean,
  status: string,
  genderPreference: GenderPreference,
  avatarUrl?: string,
  captainName?: string,
  onPress: (id: string) => void
}) => {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  const genderPalette =
    genderPreference === 'both'
      ? { bg: `${subtextColor}10`, text: subtextColor, icon: 'person.2.fill' as const }
      : genderPreference === 'men'
        ? { bg: '#EBF5FF', text: '#3B82F6', icon: 'person.fill' as const }
        : { bg: '#FFF1F2', text: '#F43F5E', icon: 'person.fill' as const };

  return (
    <Pressable
      className="rounded-[32px] p-5 mb-4 shadow-sm border"
      style={{ backgroundColor: cardColor, borderColor }}
      onPress={() => onPress(documentId)}
    >
      <HStack className="items-center justify-between mb-4">
        <HStack className="flex-1 items-center" space="md">
          <Avatar size="md" className="border shadow-sm" style={{ borderColor }}>
            <AvatarFallbackText>{captainName || 'Captain'}</AvatarFallbackText>
            {avatarUrl ? <AvatarImage source={{ uri: avatarUrl }} alt={captainName || 'Captain'} /> : null}
          </Avatar>
          <VStack className="flex-1" space="xs">
            <Text className="text-base font-bold" style={{ color: textColor }}>{captainName || 'Captain'}</Text>
            <Text className="text-xs font-medium" style={{ color: subtextColor }}>{formatDisplayDate(date)} • {time}</Text>
          </VStack>
        </HStack>
        <Box className="h-6 rounded-full px-3 flex-row items-center" style={{ backgroundColor: genderPalette.bg }}>
          <IconSymbol name={genderPalette.icon} size={10} color={genderPalette.text} />
          <Text className="text-[10px] font-bold ml-1 uppercase" style={{ color: genderPalette.text }}>
            {genderPreference === 'both' ? 'All' : genderPreference}
          </Text>
        </Box>
      </HStack>

      <HStack className="items-start mb-5" space="md">
        <VStack className="items-center pt-1" space="xs">
          <Box className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
          <Box className="w-0.5 h-10" style={{ backgroundColor: borderColor }} />
          <Box className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#10B981' }} />
        </VStack>
        <VStack className="flex-1 justify-between py-1">
          <Text className="text-sm font-bold" style={{ color: textColor }} numberOfLines={2}>{from}</Text>
          <Text className="text-sm font-bold" style={{ color: textColor }} numberOfLines={2}>{to}</Text>
        </VStack>
      </HStack>

      <Divider className="mb-4" style={{ backgroundColor: borderColor }} />

      <HStack className="items-center justify-between">
        <HStack className="items-center" space="xs">
          <IconSymbol name="car.fill" size={14} color={subtextColor} />
          <Text className="text-xs font-bold uppercase tracking-widest" style={{ color: subtextColor }}>{status}</Text>
        </HStack>
        <Text className="font-extrabold" style={{ color: primaryColor, fontSize: isCalculated ? 12 : 18 }}>
          {isCalculated ? 'CALCULATED ON DEMAND' : `₹${price}`}
        </Text>
      </HStack>
    </Pressable>
  );
};

export default function FindRidesScreen() {
  const { user } = useAuth();
  const { blockedUserIds } = useBlockedUsers();
  const { profile } = useUserStore();
  const router = useRouter();
  const navigation = useNavigation();
  const ref = useRef<FlatList>(null);
  const searchInputRef = useRef<RNTextInput>(null);
  useScrollToTop(ref);

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabLongPress' as any, () => {
      searchInputRef.current?.focus();
    });
    return unsubscribe;
  }, [navigation]);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  const [gender, setGender] = useState('both');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [selectedCity, setSelectedCity] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const citySheetRef = useRef<BottomSheetModal>(null);
  const [hasLoadedInitialCity, setHasLoadedInitialCity] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadInitialCity = async () => {
      try {
        const storedCity = await AsyncStorage.getItem(LAST_SELECTED_CITY_KEY);
        if (!isMounted) return;
        if (storedCity) setSelectedCity(storedCity);
        else if (profile?.city) setSelectedCity(profile.city);
      } finally {
        if (isMounted) setHasLoadedInitialCity(true);
      }
    };
    loadInitialCity();
    return () => { isMounted = false; };
  }, [profile?.city]);

  useEffect(() => {
    if (!hasLoadedInitialCity || !selectedCity) return;
    AsyncStorage.setItem(LAST_SELECTED_CITY_KEY, selectedCity).catch(() => {});
  }, [hasLoadedInitialCity, selectedCity]);

  const filteredCities = CITIES.filter(city => city.toLowerCase().includes(citySearch.toLowerCase()));

  const renderBackdrop = useCallback((props: any) => (
    <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} />
  ), []);

  useQuery({
    queryKey: ['unread-notifications-count', user?.id],
    queryFn: () => notificationService.getUnreadCount(user!.id),
    enabled: !!user?.id,
  });

  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['all-trips-paged', selectedCity, gender, date ? format(date, 'yyyy-MM-dd') : 'all'],
    queryFn: ({ pageParam = 1 }) => tripService.getTrips(pageParam as number, 10, { gender, date: date ? format(date, 'yyyy-MM-dd') : undefined, city: selectedCity }),
    enabled: hasLoadedInitialCity && Boolean(selectedCity),
    getNextPageParam: (lastPage) => {
      const { page, pageCount } = lastPage.meta.pagination;
      return page < pageCount ? page + 1 : undefined;
    },
    initialPageParam: 1,
    select: (data) => {
      const todayString = format(new Date(), 'yyyy-MM-dd');
      const allFetchedTrips = data.pages.flatMap(page => page.data);
      return allFetchedTrips.filter(trip => {
        const isOwnTrip = user && trip.creator?.id === user.id;
        const isBlockedCreator = trip.creator?.id ? blockedUserIds.includes(trip.creator.id) : false;
        const isUpcoming = date ? true : trip.date >= todayString;
        const isPublished = trip.status === 'PUBLISHED';
        return !isOwnTrip && !isBlockedCreator && isUpcoming && isPublished;
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
  });

  const onRefresh = () => refetch();
  const handleOpenFilters = () => bottomSheetModalRef.current?.present();
  const handleApplyFilters = () => bottomSheetModalRef.current?.dismiss();
  const handleResetFilters = () => { setGender('both'); setDate(undefined); bottomSheetModalRef.current?.dismiss(); };

  const trips = data as unknown as Trip[];
  const loading = isLoading && !isRefetching;

  const renderHeader = () => (
    <VStack className="pb-4" space="lg">
      <Box className="h-14 rounded-2xl flex-row items-center px-4 border" style={{ backgroundColor: cardColor, borderColor }}>
        <IconSymbol name="magnifyingglass" size={18} color={subtextColor} />
        <RNTextInput
          ref={searchInputRef}
          placeholder="Search for a city or area..."
          placeholderTextColor={subtextColor}
          style={{ flex: 1, marginLeft: 10, color: textColor, fontSize: 16 }}
        />
      </Box>
      <VStack space="xs">
        <Text className="text-2xl font-extrabold" style={{ color: textColor }}>
            {date ? `Rides in ${selectedCity}` : `Nearby Rides`}
        </Text>
        <Text className="text-xs font-bold uppercase tracking-widest" style={{ color: subtextColor }}>
            {date ? format(date, 'MMM d, yyyy') : `Upcoming in ${selectedCity || 'your city'}`}
        </Text>
      </VStack>
      <DiscoveryBannerAd />
    </VStack>
  );

  const renderFooter = () => isFetchingNextPage ? (
    <Box className="py-8 items-center"><Spinner size="small" color={primaryColor} /></Box>
  ) : null;

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <VStack className="items-center justify-center py-20 px-10" space="lg">
        <Box className="w-20 h-20 rounded-[32px] bg-gray-50 items-center justify-center rotate-3 shadow-xl">
            <IconSymbol name="car.fill" size={40} color={subtextColor} />
        </Box>
        <VStack space="xs">
            <Text className="text-3xl font-extrabold text-center" style={{ color: textColor }}>
            {selectedCity ? `No rides in ${selectedCity}` : 'Select a city'}
            </Text>
            <Text className="text-sm font-medium text-center leading-6" style={{ color: subtextColor }}>
            Be the first one to create a ride in this city and help others!
            </Text>
        </VStack>
        {selectedCity && (
          <Button className="h-14 rounded-2xl w-full" style={{ backgroundColor: primaryColor }} onPress={() => router.push('/create')}>
            <ButtonText className="text-white font-extrabold uppercase tracking-widest">Create a Ride</ButtonText>
          </Button>
        )}
        {(gender !== 'both' || date !== undefined) && (
          <Pressable onPress={handleResetFilters} className="mt-2">
            <Text className="text-sm font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>Clear Filters</Text>
          </Pressable>
        )}
      </VStack>
    );
  };

  return (
    <Box className="flex-1" style={{ backgroundColor }}>
      <Tabs.Screen
        options={{
          headerLeft: () => (
            <Pressable
              className="flex-row items-center ml-4 px-3 py-1 rounded-full border shadow-sm"
              style={{ backgroundColor: cardColor, borderColor }}
              onPress={() => citySheetRef.current?.present()}
            >
              <IconSymbol name="mappin.circle.fill" size={14} color={primaryColor} />
              <VStack className="ml-2">
                <Text className="text-[8px] font-extrabold uppercase tracking-tighter" style={{ color: subtextColor }}>City</Text>
                <HStack className="items-center" space="xs">
                  <Text className="text-xs font-extrabold" style={{ color: textColor }}>{selectedCity || 'Select'}</Text>
                  <IconSymbol name="chevron.down" size={10} color={primaryColor} />
                </HStack>
              </VStack>
            </Pressable>
          )
        }}
      />
      
      {loading ? (
        <FindRidesSkeleton />
      ) : (
        <FlatList
          ref={ref}
          data={trips}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TripCard
              documentId={item.documentId}
              from={item.startingPoint}
              to={item.destination}
              date={item.date}
              time={item.time}
              price={item.pricePerSeat?.toString()}
              isCalculated={item.isPriceCalculated}
              status={item.status}
              genderPreference={item.genderPreference}
              avatarUrl={typeof item.creator?.userProfile?.avatar === 'string' ? item.creator.userProfile.avatar : (item.creator?.userProfile?.avatar as any)?.url}
              captainName={item.creator?.userProfile?.fullName || item.creator?.username}
              onPress={(id) => router.push(`/trip/${id}`)}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={{ padding: 20 }}
          onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.5}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={primaryColor} />}
        />
      )}

      {/* Filter FAB */}
      <Pressable
        className="absolute right-6 bottom-8 h-16 w-16 rounded-full items-center justify-center shadow-xl"
        style={{ backgroundColor: primaryColor }}
        onPress={handleOpenFilters}
      >
        <IconSymbol name="slider.horizontal.3" size={24} color="#fff" />
      </Pressable>

      <FilterBottomSheet ref={bottomSheetModalRef} gender={gender} setGender={setGender} date={date} setDate={setDate} onApply={handleApplyFilters} onReset={handleResetFilters} />

      <BottomSheetModal
        ref={citySheetRef}
        snapPoints={['80%']}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: cardColor, borderRadius: 32 }}
        handleIndicatorStyle={{ backgroundColor: subtextColor, width: 40 }}
        enablePanDownToClose
        keyboardBehavior="fillParent"
        keyboardBlurBehavior="restore"
      >
        <BottomSheetFlatList
          data={filteredCities}
          keyExtractor={(item: string) => item}
          ListHeaderComponent={<CitySheetHeader citySearch={citySearch} setCitySearch={setCitySearch} textColor={textColor} subtextColor={subtextColor} borderColor={borderColor} />}
          renderItem={({ item }: { item: string }) => {
            const isActive = item === selectedCity;
            return (
              <Pressable
                className="mx-6 mb-2 rounded-2xl p-4 border"
                style={{ backgroundColor: isActive ? `${primaryColor}05` : 'transparent', borderColor: isActive ? primaryColor : 'transparent' }}
                onPress={() => { setSelectedCity(item); setCitySearch(''); citySheetRef.current?.dismiss(); }}
              >
                <HStack className="items-center" space="md">
                  <Box className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: isActive ? primaryColor : `${subtextColor}10` }}>
                    <IconSymbol name="mappin.circle.fill" size={18} color={isActive ? '#fff' : subtextColor} />
                  </Box>
                  <Text className="flex-1 text-base font-bold" style={{ color: isActive ? primaryColor : textColor }}>{item}</Text>
                  {isActive && <Box className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: primaryColor }}><IconSymbol name="checkmark" size={12} color="#fff" /></Box>}
                </HStack>
              </Pressable>
            );
          }}
          contentContainerStyle={{ paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        />
      </BottomSheetModal>
    </Box>
  );
}
