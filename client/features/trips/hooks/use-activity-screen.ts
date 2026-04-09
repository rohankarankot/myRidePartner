import { useCallback, useMemo, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect, useScrollToTop } from '@react-navigation/native';
import { useAuth } from '@/context/auth-context';
import { joinRequestService } from '@/services/join-request-service';
import { tripService } from '@/services/trip-service';
import { ActivityFilterTab } from '@/features/trips/constants/activity';
import { getFilteredActivityData } from '@/features/trips/utils/activity';

export function useActivityScreen() {
  const params = useLocalSearchParams<{ tab?: ActivityFilterTab }>();
  const [activeTab, setActiveTab] = useState<ActivityFilterTab>(params.tab ?? 'published');
  const { user } = useAuth();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  useScrollToTop(scrollRef);

  useFocusEffect(
    useCallback(() => {
      if (params.tab) {
        setActiveTab(params.tab);
      }
    }, [params.tab])
  );

  const {
    data: trips = [],
    isLoading: isLoadingTrips,
    isRefetching: isRefetchingTrips,
    refetch: refetchTrips,
  } = useQuery({
    queryKey: ['trips', user?.id],
    queryFn: () => tripService.getUserTrips(user!.id),
    enabled: !!user?.id,
  });

  const {
    data: requests = [],
    isLoading: isLoadingRequests,
    isRefetching: isRefetchingRequests,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: ['join-requests', user?.id],
    queryFn: () => joinRequestService.getJoinRequestsForUser(user!.id),
    enabled: !!user?.id,
  });

  const onRefresh = () => {
    refetchTrips();
    refetchRequests();
  };

  const isLoading = isLoadingTrips || isLoadingRequests;
  const isRefetching = isRefetchingTrips || isRefetchingRequests;

  const { displayRequests, displayTrips } = useMemo(
    () =>
      getFilteredActivityData({
        activeTab,
        requests,
        trips,
      }),
    [activeTab, requests, trips]
  );

  return {
    activeTab,
    displayRequests,
    displayTrips,
    isLoading,
    isRefetching,
    onRefresh,
    router,
    scrollRef,
    setActiveTab,
  };
}
