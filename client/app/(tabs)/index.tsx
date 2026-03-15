import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { tripService } from '@/services/trip-service';
import { Trip, GenderPreference } from '@/types/api';
import { useRouter, useNavigation } from 'expo-router';
import { isToday, isTomorrow, format } from 'date-fns';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FilterBottomSheet } from '@/components/FilterBottomSheet';
import { notificationService } from '@/services/notification-service';
import { useQuery } from '@tanstack/react-query';
import { useScrollToTop } from '@react-navigation/native';

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

// Reusable component based on the original static design
const TripCard = ({ documentId, from, to, date, time, price, isCalculated, status, genderPreference, onPress }: {
  documentId: string,
  from: string,
  to: string,
  date: string,
  time: string,
  price: string | undefined,
  isCalculated: boolean,
  status: string,
  genderPreference: GenderPreference,
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
      <View style={styles.routeContainer}>
        <View style={styles.dotContainer}>
          <View style={[styles.dot, { backgroundColor: primaryColor }]} />
          <View style={[styles.line, { backgroundColor: borderColor }]} />
          <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
        </View>
        <View style={styles.addresses}>
          <View style={styles.addressRow}>
            <Text style={[styles.addressText, { color: textColor }]} numberOfLines={1}>{from}</Text>
            {status !== 'PUBLISHED' && (
              <View style={[styles.statusBadge, { backgroundColor: getTripStatusColor(status as any, '#10B981', '#EF4444', '#3B82F6', '#6B7280') }]}>
                <Text style={styles.statusText}>{status}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.addressText, { color: textColor }]} numberOfLines={1}>{to}</Text>
        </View>
        <View style={[styles.genderBadge, { backgroundColor: genderPreference === 'both' ? '#F3F4FB' : genderPreference === 'men' ? '#EBF5FF' : '#FFF1F2' }]}>
          <IconSymbol
            name={genderPreference === 'both' ? 'person.2.fill' : genderPreference === 'men' ? 'person.fill' : 'person.fill'}
            size={10}
            color={genderPreference === 'both' ? '#6B7280' : genderPreference === 'men' ? '#3B82F6' : '#F43F5E'}
          />
          <Text style={[styles.genderText, { color: genderPreference === 'both' ? '#6B7280' : genderPreference === 'men' ? '#3B82F6' : '#F43F5E' }]}>
            {genderPreference === 'both' ? 'All' : genderPreference === 'men' ? 'Men' : 'Women'}
          </Text>
        </View>
      </View>

      <View style={[styles.cardDivider, { backgroundColor: borderColor }]} />

      <View style={styles.cardFooter}>
        <View style={styles.footerInfo}>
          <IconSymbol name="calendar" size={16} color={subtextColor} />
          <Text style={[styles.footerText, { color: subtextColor }]}>{formatDisplayDate(date)} at {time}</Text>
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
    queryKey: ['all-trips-paged', gender, date ? format(date, 'yyyy-MM-dd') : 'all'],
    queryFn: ({ pageParam = 1 }) => tripService.getTrips(
      pageParam as number,
      10,
      {
        gender,
        date: date ? format(date, 'yyyy-MM-dd') : undefined
      }
    ),
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
          // Filter for upcoming trips (only if no specific date filter is applied)
          const isUpcoming = date ? true : trip.date >= todayString;
          // Only show published trips
          const isPublished = trip.status === 'PUBLISHED';

          return !isOwnTrip && isUpcoming && isPublished;
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
    <View style={{ paddingTop: 20 }}>

      <View style={[styles.searchContainer, { backgroundColor: cardColor, borderColor }]}>
        <IconSymbol name="magnifyingglass" size={20} color={subtextColor} />
        <TextInput
          ref={searchInputRef}
          placeholder="Search for a city or area..."
          placeholderTextColor={subtextColor}
          style={[styles.searchInput, { color: textColor }]}
        />
      </View>
      <Text style={[styles.sectionTitle, { color: textColor, marginTop: 20 }]}>
        {date ? `Rides for ${format(date, 'MMM d, yyyy')}` : 'Upcoming Rides'}
      </Text>
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
        <Text style={[styles.emptyText, { color: subtextColor }]}>No upcoming rides found.</Text>
        {(gender !== 'both' || date !== undefined) && (
          <TouchableOpacity onPress={handleResetFilters}>
            <Text style={{ color: primaryColor, fontWeight: '600' }}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
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
  },
  routeContainer: {
    flexDirection: 'row',
  },
  dotContainer: {
    alignItems: 'center',
    marginRight: 15,
    justifyContent: 'space-between',
    paddingVertical: 5,
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
