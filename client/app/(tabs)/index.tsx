import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { tripService } from '@/services/trip-service';
import { Trip, GenderPreference } from '@/types/api';
import { useRouter, useNavigation } from 'expo-router';
import { isToday, isTomorrow, format } from 'date-fns';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import { useUserStore } from '@/store/user-store';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop, BottomSheetTextInput, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { CITIES } from '@/constants/cities';
import { FilterBottomSheet } from '@/components/FilterBottomSheet';
import { Tabs } from 'expo-router';
import { notificationService } from '@/services/notification-service';
import { useScrollToTop } from '@react-navigation/native';
import { DiscoveryBannerAd } from '@/features/ads/components/discovery-banner-ad';
import { useBlockedUsers } from '@/features/safety/hooks/use-blocked-users';

const LAST_SELECTED_CITY_KEY = 'find_rides_last_selected_city';

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return '';
  const tripDate = new Date(dateStr); // Strapi returns YYYY-MM-DD

  if (isToday(tripDate)) {
    return 'Today';
  } else if (isTomorrow(tripDate)) {
    return 'Tomorrow';
  } else {
    return format(tripDate, 'MMM d');
  }
};

// City sheet header — defined outside the screen component so its reference is
// stable across re-renders, preventing BottomSheetFlatList from remounting it
// (which would dismiss the keyboard on every keystroke).
const CitySheetHeader = React.memo(({ citySearch, setCitySearch, textColor, subtextColor }: {
  citySearch: string;
  setCitySearch: (v: string) => void;
  textColor: string;
  subtextColor: string;
}) => (
  <View style={{ padding: 24, paddingBottom: 16 }}>
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: '800', color: textColor, marginBottom: 4 }}>
        Select City
      </Text>
      <Text style={{ fontSize: 14, color: subtextColor }}>
        Choose your city to find nearby rides
      </Text>
    </View>
    <View style={{
      backgroundColor: `${subtextColor}10`,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      borderRadius: 12,
      height: 48
    }}>
      <IconSymbol name="magnifyingglass" size={18} color={subtextColor} />
      <BottomSheetTextInput
        placeholder="Search your city..."
        placeholderTextColor={subtextColor}
        style={{ flex: 1, marginLeft: 10, color: textColor, fontSize: 15 }}
        value={citySearch}
        onChangeText={setCitySearch}
        autoCorrect={false}
        autoCapitalize="words"
      />
    </View>
  </View>
));

// Reusable component matching the Activity screen card style
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

  return (
    <TouchableOpacity
      style={[styles.tripCard, { backgroundColor: cardColor }]}
      onPress={() => onPress(documentId)}
    >
      {/* Header: Avatar | Name + Date·Time */}
      <View style={styles.cardHeader}>
        <Image
          source={avatarUrl ? { uri: avatarUrl } : { uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' }}
          style={styles.cardAvatar}
        />
        <View style={styles.captainInfo}>
          <Text style={[styles.captainName, { color: textColor }]}>{captainName || 'Captain'}</Text>
          <Text style={[styles.timeText, { color: subtextColor }]}>{formatDisplayDate(date)} • {time}</Text>
        </View>
        {status !== 'PUBLISHED' && (
          <View style={[styles.statusBadge, { backgroundColor: getTripStatusColor(status as any, '#10B981', '#EF4444', '#3B82F6', '#6B7280') }]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        )}
      </View>

      {/* Route */}
      <View style={styles.routeRow}>
        <View style={styles.iconColumn}>
          <View style={[styles.dot, { backgroundColor: primaryColor }]} />
          <View style={[styles.line, { backgroundColor: borderColor }]} />
          <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
        </View>
        <View style={styles.addresses}>
          <Text style={[styles.addressText, { color: textColor }]} numberOfLines={1}>{from}</Text>
          <Text style={[styles.addressText, { color: textColor, marginTop: 20 }]} numberOfLines={1}>{to}</Text>
        </View>
        <View style={[styles.genderBadge, { backgroundColor: genderPreference === 'both' ? '#F3F4FB' : genderPreference === 'men' ? '#EBF5FF' : '#FFF1F2' }]}>
          <IconSymbol
            name={genderPreference === 'both' ? 'person.2.fill' : 'person.fill'}
            size={10}
            color={genderPreference === 'both' ? '#6B7280' : genderPreference === 'men' ? '#3B82F6' : '#F43F5E'}
          />
          <Text style={[styles.genderText, { color: genderPreference === 'both' ? '#6B7280' : genderPreference === 'men' ? '#3B82F6' : '#F43F5E' }]}>
            {genderPreference === 'both' ? 'All' : genderPreference === 'men' ? 'Men' : 'Women'}
          </Text>
        </View>
      </View>

      <View style={[styles.cardDivider, { backgroundColor: borderColor }]} />

      {/* Footer: price */}
      <View style={styles.cardFooter}>
        <View style={styles.footerInfo}>
          <IconSymbol name="car.fill" size={16} color={subtextColor} />
          <Text style={[styles.footerText, { color: subtextColor }]}>{status}</Text>
        </View>
        <Text style={[styles.priceTag, { color: primaryColor, fontSize: isCalculated ? 14 : 18 }]}>
          {isCalculated ? 'Calculated on demand' : `₹${price}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function FindRidesScreen() {

  const { user } = useAuth();
  const { blockedUserIds } = useBlockedUsers();
  const { profile } = useUserStore();
  const router = useRouter();
  const navigation = useNavigation();
  const ref = useRef<FlatList>(null);
  const searchInputRef = useRef<import('react-native').TextInput>(null);
  useScrollToTop(ref);

  // Long press on the tab: focus search input
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

  // Filter state
  const [gender, setGender] = useState('both');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);

  // City selection state (static for now)
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

        if (storedCity) {
          setSelectedCity(storedCity);
        } else if (profile?.city) {
          setSelectedCity(profile.city);
        }
      } finally {
        if (isMounted) {
          setHasLoadedInitialCity(true);
        }
      }
    };

    loadInitialCity();

    return () => {
      isMounted = false;
    };
  }, [profile?.city]);

  useEffect(() => {
    if (!hasLoadedInitialCity || !selectedCity) {
      return;
    }

    AsyncStorage.setItem(LAST_SELECTED_CITY_KEY, selectedCity).catch(() => {
      // Non-blocking preference persistence for the browse city.
    });
  }, [hasLoadedInitialCity, selectedCity]);

  const filteredCities = CITIES.filter(city =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} />
    ),
    []
  );

  const { data: unreadCount = 0 } = useQuery({
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
    queryFn: ({ pageParam = 1 }) => tripService.getTrips(
      pageParam as number,
      10,
      {
        gender,
        date: date ? format(date, 'yyyy-MM-dd') : undefined,
        city: selectedCity
      }
    ),
    enabled: hasLoadedInitialCity && Boolean(selectedCity),
    getNextPageParam: (lastPage) => {
      const { page, pageCount } = lastPage.meta.pagination;
      return page < pageCount ? page + 1 : undefined;
    },
    initialPageParam: 1,
    select: (data) => {
      const todayString = new Date().toISOString().split('T')[0];
      const allFetchedTrips = data.pages.flatMap(page => page.data);

      return allFetchedTrips
        .filter(trip => {
          // Exclude own trips
          const isOwnTrip = user && trip.creator?.id === user.id;
          const isBlockedCreator = trip.creator?.id ? blockedUserIds.includes(trip.creator.id) : false;
          // Filter for upcoming trips (only if no specific date filter is applied)
          const isUpcoming = date ? true : trip.date >= todayString;
          // Only show published trips
          const isPublished = trip.status === 'PUBLISHED';

          return !isOwnTrip && !isBlockedCreator && isUpcoming && isPublished;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
  });

  const onRefresh = () => {
    refetch();
  };

  const handleOpenFilters = () => {
    bottomSheetModalRef.current?.present();
  };

  const handleApplyFilters = () => {
    bottomSheetModalRef.current?.dismiss();
  };



  const handleResetFilters = () => {
    setGender('both');
    setDate(undefined);
    bottomSheetModalRef.current?.dismiss();
  };

  const trips = data as unknown as Trip[];
  const loading = isLoading && !isRefetching;

  const renderHeader = () => (
    <View style={{ paddingTop: 10, paddingBottom: 8 }}>
      <View style={[styles.searchContainer, { backgroundColor: cardColor, borderColor, height: 54, borderRadius: 16 }]}>
        <IconSymbol name="magnifyingglass" size={20} color={subtextColor} />
        <TextInput
          ref={searchInputRef}
          placeholder="Search for a city or area..."
          placeholderTextColor={subtextColor}
          style={[styles.searchInput, { color: textColor, fontSize: 16 }]}
        />
      </View>
      <Text style={[styles.sectionTitle, { color: textColor, marginTop: 24, fontSize: 18, fontWeight: '700' }]}>
        {date ? `Rides in ${selectedCity} for ${format(date, 'MMM d, yyyy')}` : `Upcoming Rides in ${selectedCity || 'your city'}`}
      </Text>
      <DiscoveryBannerAd />
    </View>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={primaryColor} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <IconSymbol name="list.bullet" size={48} color={subtextColor} />
        <Text style={[styles.emptyText, { color: subtextColor }]}>
          {selectedCity ? `Hmm, no rides found in ${selectedCity}.` : 'Select a city to view rides.'}
        </Text>
        <Text style={[styles.emptyText, { color: subtextColor }]}>
          Be the first to create a ride.
        </Text>
        {selectedCity && (
          <TouchableOpacity
            style={[styles.emptyPrimaryButton, { backgroundColor: primaryColor }]}
            onPress={() => router.push('/create')}
          >
            <Text style={styles.emptyPrimaryButtonText}>Create a Ride</Text>
          </TouchableOpacity>
        )}
        {(gender !== 'both' || date !== undefined) && (
          <TouchableOpacity
            style={styles.emptySecondaryButton}
            onPress={handleResetFilters}
          >
            <Text style={{ color: primaryColor, fontWeight: '600' }}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs.Screen
        options={{
          headerTitle: 'My Ride Partner',
          headerLeft: () => (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                marginLeft: 16,
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 12,
                backgroundColor: 'rgba(0,0,0,0.03)'
              }}
              activeOpacity={0.7}
              onPress={() => citySheetRef.current?.present()}
            >
              <IconSymbol name="mappin.circle.fill" size={18} color={primaryColor} />
              <View>
                <Text style={{ fontSize: 10, fontWeight: '700', color: subtextColor, textTransform: 'uppercase', letterSpacing: 0.5 }}>City</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: textColor }}>{selectedCity || 'Select'}</Text>
                  <IconSymbol name="chevron.down" size={10} color={primaryColor} />
                </View>
              </View>
            </TouchableOpacity>
          )
        }}
      />
      <View style={[styles.safe, { backgroundColor }]} >
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
              avatarUrl={
                typeof item.creator?.userProfile?.avatar === 'string'
                  ? item.creator.userProfile.avatar
                  : (item.creator?.userProfile?.avatar as any)?.url
              }
              captainName={item.creator?.userProfile?.fullName || item.creator?.username}
              onPress={(id) => router.push(`/trip/${id}`)}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.container}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
          }
        />
      </View>

      {/* Custom FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: primaryColor }]}
        onPress={handleOpenFilters}
        activeOpacity={0.8}
      >
        <IconSymbol name="slider.horizontal.3" size={24} color="#fff" />
      </TouchableOpacity>

      <FilterBottomSheet
        ref={bottomSheetModalRef}
        gender={gender}
        setGender={setGender}
        date={date}
        setDate={setDate}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {/* City Selection Bottom Sheet */}
      <BottomSheetModal
        ref={citySheetRef}
        snapPoints={['80%']}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: cardColor }}
        handleIndicatorStyle={{ backgroundColor: subtextColor }}
        enablePanDownToClose
        keyboardBehavior="fillParent"
        keyboardBlurBehavior="restore"
      >
        <BottomSheetFlatList
          data={filteredCities}
          keyExtractor={(item: string) => item}
          ListHeaderComponent={
            <CitySheetHeader
              citySearch={citySearch}
              setCitySearch={setCitySearch}
              textColor={textColor}
              subtextColor={subtextColor}
            />
          }
          renderItem={({ item }: { item: string }) => {
            const isActive = item === selectedCity;
            return (
              <TouchableOpacity
                style={{
                  paddingVertical: 18,
                  paddingHorizontal: 12,
                  borderRadius: 16,
                  marginBottom: 8,
                  marginHorizontal: 24,
                  backgroundColor: isActive ? `${primaryColor}10` : 'transparent',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: isActive ? primaryColor : 'transparent'
                }}
                onPress={() => {
                  setSelectedCity(item);
                  setCitySearch('');
                  citySheetRef.current?.dismiss();
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: isActive ? primaryColor : `${subtextColor}15`,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <IconSymbol
                      name="mappin.circle.fill"
                      size={20}
                      color={isActive ? '#fff' : subtextColor}
                    />
                  </View>
                  <Text style={{
                    fontSize: 17,
                    color: isActive ? primaryColor : textColor,
                    fontWeight: isActive ? '700' : '500'
                  }}>
                    {item}
                  </Text>
                </View>
                {isActive && (
                  <View style={{ backgroundColor: primaryColor, borderRadius: 12, padding: 4 }}>
                    <IconSymbol name="checkmark" size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      </BottomSheetModal>
    </View>
  );
}

const getTripStatusColor = (status: string, success: string, danger: string, primary: string, sub: string) => {
  switch (status) {
    case 'COMPLETED': return success;
    case 'STARTED': return primary;
    case 'CANCELLED': return danger;
    case 'PUBLISHED': return '#10B981';
    default: return sub;
  }
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  container: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  tripCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconColumn: {
    alignItems: 'center',
    marginRight: 12,
    paddingVertical: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
  },
  captainInfo: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  captainName: {
    fontSize: 16,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 12,
    marginTop: 2,
  },
  addresses: {
    flex: 1,
    justifyContent: 'space-between',
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 15,
    fontWeight: '500',
  },
  cardDivider: {
    height: 1,
    marginVertical: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 13,
  },
  priceTag: {
    fontSize: 18,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  genderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    height: 24,
    alignSelf: 'center',
  },
  genderText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  emptyPrimaryButton: {
    minWidth: 170,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  emptyPrimaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  emptySecondaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
});
