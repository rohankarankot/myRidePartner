import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, TextInput as RNTextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal } from '@gorhom/bottom-sheet';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useNavigation } from 'expo-router';
import { format } from 'date-fns';
import { useScrollToTop } from '@react-navigation/native';
import { CITIES } from '@/constants/cities';
import { useAuth } from '@/context/auth-context';
import { useBlockedUsers } from '@/features/safety/hooks/use-blocked-users';
import { useBottomSheetBackHandler } from '@/hooks/use-bottom-sheet-back-handler';
import { notificationService } from '@/services/notification-service';
import { tripService } from '@/services/trip-service';
import { useUserStore } from '@/store/user-store';
import { Trip } from '@/types/api';
import { LAST_SELECTED_CITY_KEY, SEARCH_DEBOUNCE_MS } from '@/features/trips/constants/find-rides';
import { tripQueryKeys } from '@/features/trips/query-keys';
import { filterAndSortTrips } from '@/features/trips/utils/find-rides';

export function useFindRidesScreen() {
  const { user } = useAuth();
  const { blockedUserIds } = useBlockedUsers();
  const { profile } = useUserStore();
  const navigation = useNavigation();

  const listRef = useRef<FlatList>(null);
  const searchInputRef = useRef<RNTextInput>(null);
  const filterSheetRef = useRef<BottomSheetModal>(null);
  const citySheetRef = useRef<BottomSheetModal>(null);

  useScrollToTop(listRef);

  const [gender, setGender] = useState('both');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedCity, setSelectedCity] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [debouncedFromSearch, setDebouncedFromSearch] = useState('');
  const [debouncedToSearch, setDebouncedToSearch] = useState('');
  const [hasLoadedInitialCity, setHasLoadedInitialCity] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isCitySheetOpen, setIsCitySheetOpen] = useState(false);

  useBottomSheetBackHandler([
    { isOpen: isFilterSheetOpen, ref: filterSheetRef },
    { isOpen: isCitySheetOpen, ref: citySheetRef },
  ]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabLongPress' as never, () => {
      searchInputRef.current?.focus();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    let isMounted = true;

    const loadInitialCity = async () => {
      try {
        const storedCity = await AsyncStorage.getItem(LAST_SELECTED_CITY_KEY);

        if (!isMounted) {
          return;
        }

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

    AsyncStorage.setItem(LAST_SELECTED_CITY_KEY, selectedCity).catch(() => {});
  }, [hasLoadedInitialCity, selectedCity]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedFromSearch(fromSearch.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [fromSearch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedToSearch(toSearch.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [toSearch]);

  const filteredCities = useMemo(
    () => CITIES.filter((city) => city.toLowerCase().includes(citySearch.toLowerCase())),
    [citySearch]
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} />
    ),
    []
  );

  useQuery({
    queryKey: ['unread-notifications-count', user?.id],
    queryFn: () => notificationService.getUnreadCount(user!.id),
    enabled: Boolean(user?.id),
  });

  const tripDate = date ? format(date, 'yyyy-MM-dd') : undefined;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: tripQueryKeys.pagedList(
      selectedCity,
      gender,
      tripDate,
      debouncedFromSearch,
      debouncedToSearch
    ),
    queryFn: ({ pageParam = 1 }) =>
      tripService.getTrips(pageParam as number, 10, {
        city: selectedCity,
        date: tripDate,
        fromQuery: debouncedFromSearch || undefined,
        gender,
        toQuery: debouncedToSearch || undefined,
      }),
    placeholderData: (previousData) => previousData,
    enabled: hasLoadedInitialCity && Boolean(selectedCity),
    getNextPageParam: (lastPage) => {
      const { page, pageCount } = lastPage.meta.pagination;
      return page < pageCount ? page + 1 : undefined;
    },
    initialPageParam: 1,
    select: (queryData) =>
      filterAndSortTrips({
        blockedUserIds,
        date,
        trips: queryData.pages.flatMap((page) => page.data),
        userId: user?.id,
      }),
  });

  const trips = (data as Trip[] | undefined) ?? [];
  const loading = isLoading && !isRefetching;
  const hasActiveRouteSearch = Boolean(
    debouncedFromSearch || debouncedToSearch || fromSearch.trim() || toSearch.trim()
  );
  const showInitialLoading = loading && trips.length === 0 && !hasActiveRouteSearch;

  const openFilters = () => {
    setIsFilterSheetOpen(true);
    filterSheetRef.current?.present();
  };
  const applyFilters = () => filterSheetRef.current?.dismiss();
  const openCitySheet = () => {
    setIsCitySheetOpen(true);
    citySheetRef.current?.present();
  };
  const refreshTrips = () => refetch();

  const resetFilters = () => {
    setGender('both');
    setDate(undefined);
    filterSheetRef.current?.dismiss();
  };

  const selectCity = (city: string) => {
    setSelectedCity(city);
    setCitySearch('');
    citySheetRef.current?.dismiss();
  };

  const loadMoreTrips = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return {
    applyFilters,
    citySearch,
    citySheetRef,
    date,
    filteredCities,
    filterSheetRef,
    fromSearch,
    gender,
    hasActiveRouteSearch,
    isFetchingNextPage,
    isRefetching,
    listRef,
    loadMoreTrips,
    loading,
    openCitySheet,
    openFilters,
    onCitySheetDismiss: () => setIsCitySheetOpen(false),
    onFilterSheetDismiss: () => setIsFilterSheetOpen(false),
    refreshTrips,
    renderBackdrop,
    resetFilters,
    searchInputRef,
    selectCity,
    selectedCity,
    setCitySearch,
    setDate,
    setFromSearch,
    setGender,
    setToSearch,
    showInitialLoading,
    toSearch,
    trips,
  };
}
