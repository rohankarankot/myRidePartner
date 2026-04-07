import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useScrollToTop, useFocusEffect } from '@react-navigation/native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { tripService } from '@/services/trip-service';
import { joinRequestService } from '@/services/join-request-service';
import { TripStatus, JoinRequestStatus, GenderPreference } from '@/types/api';
import { useAuth } from '@/context/auth-context';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Divider } from '@/components/ui/divider';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/skeleton';

type FilterTab = 'published' | 'in-progress' | 'completed' | 'part-of' | 'leading';

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'published', label: 'Published' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'part-of', label: 'Part Of' },
];

function ActivitySkeleton() {
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  return (
    <Box className="flex-1" style={{ backgroundColor }}>
      <Box className="border-b" style={{ borderBottomColor: borderColor || 'rgba(0,0,0,0.05)' }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              width={index === 1 ? 112 : 94}
              height={38}
              borderRadius={999}
              style={{ marginRight: 8 }}
            />
          ))}
        </ScrollView>
      </Box>

      <ScrollView contentContainerStyle={styles.container}>
        <Skeleton width="38%" height={18} borderRadius={9} style={{ marginBottom: 16 }} />

        {Array.from({ length: 4 }).map((_, index) => (
          <Box
            key={index}
            className="rounded-2xl p-4 mb-4"
            style={[styles.cardShadow, { backgroundColor: cardColor }]}
          >
            <HStack className="items-start justify-between mb-4">
              <HStack className="flex-1 items-center" space="md">
                <Skeleton width={40} height={40} borderRadius={20} />
                <VStack className="flex-1" space="xs">
                  <Skeleton width={index % 2 === 0 ? '52%' : '44%'} height={16} borderRadius={8} />
                  <Skeleton width="36%" height={14} borderRadius={7} />
                </VStack>
              </HStack>
              <VStack className="items-end" space="xs">
                <Skeleton width={74} height={24} borderRadius={12} />
                <Skeleton width={68} height={20} borderRadius={10} />
              </VStack>
            </HStack>

            <HStack className="mb-4 items-start">
              <VStack className="items-center mr-3 pt-1">
                <Skeleton width={8} height={8} borderRadius={4} />
                <Skeleton width={2} height={34} borderRadius={1} style={{ marginVertical: 4 }} />
                <Skeleton width={8} height={8} borderRadius={4} />
              </VStack>

              <VStack className="flex-1" space="md">
                <Skeleton width={index % 2 === 0 ? '80%' : '68%'} height={16} borderRadius={8} />
                <Skeleton width={index % 2 === 0 ? '72%' : '84%'} height={16} borderRadius={8} />
              </VStack>

              <Skeleton width={52} height={24} borderRadius={12} style={{ marginLeft: 12 }} />
            </HStack>

            <Divider style={{ backgroundColor: borderColor, marginBottom: 12 }} />

            <HStack className="items-center justify-between">
              <Skeleton width={index % 2 === 0 ? 120 : 154} height={18} borderRadius={9} />
              <Skeleton width={18} height={18} borderRadius={9} />
            </HStack>
          </Box>
        ))}
      </ScrollView>
    </Box>
  );
}

function TripCard(props: {
  documentId: string;
  from: string;
  to: string;
  date: string;
  price?: number | null;
  status: TripStatus | JoinRequestStatus;
  isPriceCalculated: boolean | null;
  genderPreference: GenderPreference;
  avatarUrl?: string;
  captainName?: string;
  pendingRequestsCount?: number;
  onPress: (documentId: string) => void;
}) {
  const {
    documentId,
    from,
    to,
    date,
    price,
    status,
    isPriceCalculated,
    genderPreference,
    avatarUrl,
    captainName,
    pendingRequestsCount = 0,
    onPress,
  } = props;

  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');
  const successColor = useThemeColor({}, 'success');
  const successBg = useThemeColor({}, 'successBg');
  const dangerColor = useThemeColor({}, 'danger');
  const dangerBg = useThemeColor({}, 'dangerBg');

  const getStatusStyle = () => {
    switch (status) {
      case 'APPROVED':
        return { bg: successBg, text: successColor };
      case 'PENDING':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'REJECTED':
      case 'CANCELLED':
        return { bg: dangerBg, text: dangerColor };
      case 'COMPLETED':
        return { bg: successBg, text: successColor };
      case 'STARTED':
        return { bg: `${primaryColor}15`, text: primaryColor };
      case 'PUBLISHED':
        return { bg: '#10B98115', text: '#10B981' };
      default:
        return { bg: borderColor, text: subtextColor };
    }
  };

  const statusStyle = getStatusStyle();
  const genderPalette =
    genderPreference === 'both'
      ? { bg: '#F3F4FB', text: '#6B7280', icon: 'person.2.fill' as const }
      : genderPreference === 'men'
        ? { bg: '#EBF5FF', text: '#3B82F6', icon: 'person.fill' as const }
        : { bg: '#FFF1F2', text: '#F43F5E', icon: 'person.fill' as const };

  return (
    <Pressable
      className="rounded-2xl p-4 mb-4"
      style={[styles.cardShadow, { backgroundColor: cardColor }]}
      onPress={() => onPress(documentId)}
    >
      <HStack className="items-start justify-between mb-4">
        <HStack className="flex-1 items-center" space="md">
          <Avatar size="md">
            <AvatarFallbackText>{captainName || 'Captain'}</AvatarFallbackText>
            {avatarUrl ? <AvatarImage source={{ uri: avatarUrl }} alt={captainName || 'Captain'} /> : null}
          </Avatar>
          <VStack className="flex-1" space="xs">
            <Text className="text-base font-bold" style={{ color: textColor }}>
              {captainName || 'Captain'}
            </Text>
            <Text className="text-sm" style={{ color: subtextColor }}>
              {date}
            </Text>
          </VStack>
        </HStack>

        <VStack className="items-end" space="xs">
          <Box className="rounded-xl px-3 py-1" style={{ backgroundColor: statusStyle.bg }}>
            <Text className="text-[11px] font-bold" style={{ color: statusStyle.text }}>
              {status}
            </Text>
          </Box>
          {pendingRequestsCount > 0 ? (
            <Box className="rounded-[10px] px-2 py-1" style={{ backgroundColor: primaryColor }}>
              <Text className="text-[10px] font-extrabold text-white">
                {pendingRequestsCount} Pending
              </Text>
            </Box>
          ) : null}
        </VStack>
      </HStack>

      <HStack className="mb-4 items-start">
        <VStack className="items-center mr-3 pt-1">
          <Box className="h-2 w-2 rounded-full" style={{ backgroundColor: primaryColor }} />
          <Box className="w-px h-8 my-1" style={{ backgroundColor: borderColor }} />
          <Box className="h-2 w-2 rounded-full" style={{ backgroundColor: '#10B981' }} />
        </VStack>

        <VStack className="flex-1 justify-between">
          <Text className="text-base font-semibold" style={{ color: textColor }} numberOfLines={2}>
            {from}
          </Text>
          <Text
            className="text-base font-semibold mt-5"
            style={{ color: textColor }}
            numberOfLines={2}
          >
            {to}
          </Text>
        </VStack>

        <Box
          className="h-6 rounded-xl px-2 ml-3 flex-row items-center"
          style={{ backgroundColor: genderPalette.bg }}
        >
          <IconSymbol name={genderPalette.icon} size={10} color={genderPalette.text} />
          <Text className="text-[11px] font-bold ml-1" style={{ color: genderPalette.text }}>
            {genderPreference === 'both' ? 'All' : genderPreference === 'men' ? 'Men' : 'Women'}
          </Text>
        </Box>
      </HStack>

      <Divider style={{ backgroundColor: borderColor, marginBottom: 12 }} />

      <HStack className="items-center justify-between">
        <Text className="text-lg font-extrabold" style={{ color: primaryColor }}>
          {typeof price === 'number'
            ? `₹${price}`
            : isPriceCalculated
              ? 'Calculated on departure'
              : 'Price not set'}
        </Text>
        <IconSymbol name="chevron.right" size={18} color={subtextColor} />
      </HStack>
    </Pressable>
  );
}

export default function ActivityScreen() {
  const params = useLocalSearchParams<{ tab?: FilterTab }>();
  const [activeTab, setActiveTab] = useState<FilterTab>(params.tab ?? 'published');

  useFocusEffect(
    useCallback(() => {
      if (params.tab) {
        setActiveTab(params.tab);
      }
    }, [params.tab])
  );

  const { user } = useAuth();
  const router = useRouter();
  const ref = useRef<ScrollView>(null);
  useScrollToTop(ref);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

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

  const getFilteredData = () => {
    let displayTrips: any[] = [];
    let displayRequests: any[] = [];

    switch (activeTab) {
      case 'leading':
        displayTrips = trips;
        break;
      case 'part-of':
        displayRequests = requests;
        break;
      case 'published':
        displayTrips = trips.filter((t) => t.status === 'PUBLISHED');
        break;
      case 'in-progress':
        displayTrips = trips.filter((t) => t.status === 'STARTED');
        displayRequests = requests.filter(
          (r) => r.trip?.status === 'STARTED' && r.status === 'APPROVED'
        );
        break;
      case 'completed':
        displayTrips = trips.filter((t) => t.status === 'COMPLETED');
        displayRequests = requests.filter(
          (r) => r.trip?.status === 'COMPLETED' && r.status === 'APPROVED'
        );
        break;
    }

    return { displayTrips, displayRequests };
  };

  const { displayTrips, displayRequests } = getFilteredData();

  if (isLoading && !isRefetching) {
    return <ActivitySkeleton />;
  }

  return (
    <Box className="flex-1" style={{ backgroundColor }}>
      <Box
        className="border-b"
        style={{ borderBottomColor: borderColor || 'rgba(0,0,0,0.05)' }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                className="rounded-full border px-4 py-2 mr-2"
                style={{
                  backgroundColor: isActive ? primaryColor : 'transparent',
                  borderColor: isActive ? primaryColor : `${subtextColor}40`,
                }}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: isActive ? '#fff' : subtextColor }}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Box>

      <ScrollView
        ref={ref}
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
      >
        {displayTrips.length === 0 && displayRequests.length === 0 ? (
          <VStack className="items-center justify-center py-[60px]" space="sm">
            <IconSymbol name="list.bullet" size={48} color={subtextColor} />
            <Text className="text-base mt-2 text-center" style={{ color: subtextColor }}>
              No {activeTab.replace('-', ' ')} activity found.
            </Text>
            <Pressable
              className="rounded-xl px-6 py-3 mt-2"
              style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
              onPress={() => router.push('/')}
            >
              <Text className="font-semibold" style={{ color: primaryColor }}>
                Find a ride
              </Text>
            </Pressable>
          </VStack>
        ) : (
          <>
            {displayTrips.length > 0 ? (
              <>
                <Text
                  className="text-base font-semibold uppercase mb-4 tracking-[1px]"
                  style={{ color: textColor }}
                >
                  Trips You&apos;re Leading
                </Text>
                {displayTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    isPriceCalculated={trip.isPriceCalculated}
                    documentId={trip.documentId}
                    from={trip.startingPoint}
                    to={trip.destination}
                    date={`${trip.date} • ${trip.time}`}
                    price={trip.pricePerSeat}
                    status={trip.status}
                    genderPreference={trip.genderPreference}
                    avatarUrl={
                      typeof trip.creator?.userProfile?.avatar === 'string'
                        ? trip.creator.userProfile.avatar
                        : (trip.creator?.userProfile?.avatar as any)?.url
                    }
                    captainName={
                      trip.creator?.userProfile?.fullName || trip.creator?.username
                    }
                    pendingRequestsCount={
                      trip.joinRequests?.filter((r: any) => r.status === 'PENDING').length
                    }
                    onPress={(docId) => router.push(`/trip/${docId}`)}
                  />
                ))}
              </>
            ) : null}

            {displayRequests.length > 0 ? (
              <>
                <Text
                  className="text-base font-semibold uppercase mb-4 tracking-[1px]"
                  style={{ color: textColor, marginTop: displayTrips.length > 0 ? 24 : 0 }}
                >
                  Trips You&apos;ve Requested
                </Text>
                {displayRequests.map((request) => (
                  <TripCard
                    key={request.id}
                    isPriceCalculated={request.trip?.isPriceCalculated}
                    documentId={request.trip?.documentId}
                    from={request.trip?.startingPoint}
                    to={request.trip?.destination}
                    date={`${request.trip?.date} • ${request.trip?.time}`}
                    price={request.trip?.pricePerSeat}
                    status={request.status}
                    genderPreference={request.trip?.genderPreference || 'both'}
                    avatarUrl={
                      typeof request.trip?.creator?.userProfile?.avatar === 'string'
                        ? request.trip.creator.userProfile.avatar
                        : (request.trip?.creator?.userProfile?.avatar as any)?.url
                    }
                    captainName={
                      request.trip?.creator?.userProfile?.fullName ||
                      request.trip?.creator?.username
                    }
                    onPress={(docId) => router.push(`/trip/${docId}`)}
                  />
                ))}
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  tabsScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
});
