import React, { useCallback, useRef, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
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
      <Box className="border-b" style={{ borderBottomColor: borderColor }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12 }}
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

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Skeleton width="38%" height={18} borderRadius={9} style={{ marginBottom: 16 }} />

        {Array.from({ length: 4 }).map((_, index) => (
          <Box
            key={index}
            className="rounded-[32px] p-5 mb-4 border"
            style={{ backgroundColor: cardColor, borderColor }}
          >
            <HStack className="items-start justify-between mb-4">
              <HStack className="flex-1 items-center" space="md">
                <Skeleton width={44} height={44} borderRadius={22} />
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
            </HStack>

            <Divider style={{ backgroundColor: borderColor, marginBottom: 16 }} />

            <HStack className="items-center justify-between">
              <Skeleton width={120} height={24} borderRadius={12} />
              <Skeleton width={20} height={20} borderRadius={10} />
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
      className="rounded-[32px] p-5 mb-4 border shadow-sm"
      style={{ backgroundColor: cardColor, borderColor }}
      onPress={() => onPress(documentId)}
    >
      <HStack className="items-start justify-between mb-6">
        <HStack className="flex-1 items-center" space="md">
          <Avatar size="md" className="border shadow-sm" style={{ borderColor }}>
            <AvatarFallbackText>{captainName || 'Captain'}</AvatarFallbackText>
            {avatarUrl ? <AvatarImage source={{ uri: avatarUrl }} alt={captainName || 'Captain'} /> : null}
          </Avatar>
          <VStack className="flex-1" space="xs">
            <Text className="text-base font-bold" style={{ color: textColor }}>
              {captainName || 'Captain'}
            </Text>
            <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: subtextColor }}>
              {date}
            </Text>
          </VStack>
        </HStack>

        <VStack className="items-end" space="xs">
          <Box className="rounded-full px-3 py-1 border shadow-sm" style={{ backgroundColor: statusStyle.bg, borderColor: statusStyle.text + '20' }}>
            <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: statusStyle.text }}>
              {status}
            </Text>
          </Box>
          {pendingRequestsCount > 0 && (
            <Box className="rounded-full px-2 py-0.5 border shadow-sm" style={{ backgroundColor: primaryColor, borderColor: '#fff' }}>
              <Text className="text-[8px] font-extrabold uppercase tracking-widest text-white">
                {pendingRequestsCount} Pending
              </Text>
            </Box>
          )}
        </VStack>
      </HStack>

      <HStack className="mb-6 items-start">
        <VStack className="items-center mr-4 pt-1">
          <Box className="h-2.5 w-2.5 rounded-full border-2" style={{ backgroundColor: primaryColor, borderColor: '#fff' }} />
          <Box className="w-1 flex-1 my-1 border-r border-dashed" style={{ borderColor }} />
          <Box className="h-2.5 w-2.5 rounded-full border-2" style={{ backgroundColor: '#10B981', borderColor: '#fff' }} />
        </VStack>

        <VStack className="flex-1 justify-between h-20">
          <Text className="text-sm font-bold" style={{ color: textColor }} numberOfLines={2}>
            {from}
          </Text>
          <Text className="text-sm font-bold" style={{ color: textColor }} numberOfLines={2}>
            {to}
          </Text>
        </VStack>

        <Box
          className="rounded-full px-3 py-1 ml-3 flex-row items-center border shadow-sm"
          style={{ backgroundColor: genderPalette.bg, borderColor: genderPalette.text + '20' }}
        >
          <IconSymbol name={genderPalette.icon} size={10} color={genderPalette.text} />
          <Text className="text-[9px] font-extrabold uppercase tracking-widest ml-1.5" style={{ color: genderPalette.text }}>
            {genderPreference === 'both' ? 'All' : genderPreference === 'men' ? 'Men' : 'Women'}
          </Text>
        </Box>
      </HStack>

      <Divider style={{ backgroundColor: borderColor }} className="mb-4" />

      <HStack className="items-center justify-between">
        <Text className="font-extrabold" style={{ color: primaryColor, fontSize: isPriceCalculated ? 12 : 18 }}>
          {isPriceCalculated ? 'CALCULATED ON DEMAND' : `₹${price}`}
        </Text>
        <Box className="w-8 h-8 rounded-full items-center justify-center bg-gray-50 border shadow-sm" style={{ borderColor }}>
            <IconSymbol name="chevron.right" size={14} color={subtextColor} />
        </Box>
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
      <Box style={{ borderBottomColor: borderColor }} className="border-b">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14 }}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                className="rounded-full border px-5 py-2 mr-3 shadow-sm"
                style={{
                  backgroundColor: isActive ? primaryColor : 'transparent',
                  borderColor: isActive ? primaryColor : borderColor,
                }}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text
                  className="text-xs font-extrabold uppercase tracking-widest"
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
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={primaryColor} />}
      >
        {displayTrips.length === 0 && displayRequests.length === 0 ? (
          <VStack className="items-center justify-center py-[100px]" space="lg">
            <Box className="w-20 h-20 rounded-[32px] bg-gray-50 items-center justify-center rotate-3 shadow-xl">
                <IconSymbol name="list.bullet" size={40} color={subtextColor} />
            </Box>
            <VStack className="items-center" space="xs">
                <Text className="text-3xl font-extrabold text-center" style={{ color: textColor }}>
                No recent activity
                </Text>
                <Text className="text-sm font-medium text-center leading-6 max-w-[240px]" style={{ color: subtextColor }}>
                Your {activeTab.replace('-', ' ')} activity is empty. Start a trip or join one to see updates here.
                </Text>
            </VStack>
            <Pressable
              className="rounded-2xl px-8 py-3.5 mt-4 shadow-sm border"
              style={{ backgroundColor: `${primaryColor}10`, borderColor: primaryColor }}
              onPress={() => router.push('/')}
            >
              <Text className="text-sm font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
                Find a ride
              </Text>
            </Pressable>
          </VStack>
        ) : (
          <>
            {displayTrips.length > 0 && (
              <>
                <Text
                  className="text-[10px] font-extrabold uppercase mb-4 tracking-widest ml-1"
                  style={{ color: subtextColor }}
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
                      trip.creator?.userProfile?.avatar?.url || trip.creator?.userProfile?.avatar
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
            )}

            {displayRequests.length > 0 && (
              <>
                <Text
                  className="text-[10px] font-extrabold uppercase mb-4 tracking-widest ml-1"
                  style={{ color: subtextColor, marginTop: displayTrips.length > 0 ? 24 : 0 }}
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
                      request.trip?.creator?.userProfile?.avatar?.url || request.trip?.creator?.userProfile?.avatar
                    }
                    captainName={
                      request.trip?.creator?.userProfile?.fullName ||
                      request.trip?.creator?.username
                    }
                    onPress={(docId) => router.push(`/trip/${docId}`)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </Box>
  );
}
