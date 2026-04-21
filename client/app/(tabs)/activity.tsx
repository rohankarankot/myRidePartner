import React from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Text } from '@/components/ui/text';
import {
  ActivityEmptyState,
  ActivitySkeleton,
  ActivityTabs,
  ActivityTripCard,
} from '@/features/trips/components/activity';
import { useActivityScreen } from '@/features/trips/hooks/use-activity-screen';
import { ActivityBannerAd } from '@/features/ads/components/activity-banner-ad';

const getAvatarUrl = (avatar?: string | { url: string; formats?: any }) =>
  typeof avatar === 'string' ? avatar : avatar?.url;

export default function ActivityScreen() {
  const {
    activeTab,
    displayRequests,
    displayTrips,
    isLoading,
    isRefetching,
    onRefresh,
    router,
    scrollRef,
    setActiveTab,
  } = useActivityScreen();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  if (isLoading && !isRefetching) {
    return <ActivitySkeleton />;
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1, backgroundColor }}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={primaryColor} />}
    >
      <ActivityTabs
        activeTab={activeTab}
        borderColor={borderColor}
        onTabChange={setActiveTab}
        primaryColor={primaryColor}
        subtextColor={subtextColor}
      />

      <ActivityBannerAd />

      <ScrollView contentContainerStyle={{ padding: 20 }} scrollEnabled={false}>
        {displayTrips.length === 0 && displayRequests.length === 0 ? (
          <ActivityEmptyState
            activeTab={activeTab}
            onFindRide={() => router.push('/')}
            primaryColor={primaryColor}
            subtextColor={subtextColor}
            textColor={textColor}
          />
        ) : (
          <>
            {displayTrips.length > 0 ? (
              <>
                <TextBlock label="Trips You&apos;re Leading" color={subtextColor} />
                {displayTrips.map((trip) => (
                  <ActivityTripCard
                    key={trip.id}
                    isPriceCalculated={trip.isPriceCalculated}
                    documentId={trip.documentId}
                    from={trip.startingPoint}
                    to={trip.destination}
                    date={`${trip.date} • ${trip.time}`}
                    price={trip.pricePerSeat}
                    status={trip.status}
                    genderPreference={trip.genderPreference}
                    avatarUrl={getAvatarUrl(trip.creator?.userProfile?.avatar)}
                    captainName={trip.creator?.userProfile?.fullName || trip.creator?.username}
                    pendingRequestsCount={trip.joinRequests?.filter((request: any) => request.status === 'PENDING').length}
                    onPress={(docId) => router.push(`/trip/${docId}`)}
                  />
                ))}
              </>
            ) : null}

            {displayRequests.length > 0 ? (
              <>
                <TextBlock
                  label="Trips You&apos;ve Requested"
                  color={subtextColor}
                  marginTop={displayTrips.length > 0 ? 24 : 0}
                />
                {displayRequests.map((request) => (
                  <ActivityTripCard
                    key={request.id}
                    isPriceCalculated={request.trip?.isPriceCalculated}
                    documentId={request.trip?.documentId}
                    from={request.trip?.startingPoint}
                    to={request.trip?.destination}
                    date={`${request.trip?.date} • ${request.trip?.time}`}
                    price={request.trip?.pricePerSeat}
                    status={request.status}
                    genderPreference={request.trip?.genderPreference || 'both'}
                    avatarUrl={getAvatarUrl(request.trip?.creator?.userProfile?.avatar)}
                    captainName={request.trip?.creator?.userProfile?.fullName || request.trip?.creator?.username}
                    onPress={(docId) => router.push(`/trip/${docId}`)}
                  />
                ))}
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </ScrollView>
  );
}

function TextBlock({ color, label, marginTop = 0 }: { color: string; label: string; marginTop?: number }) {
  return (
    <Text
      className="text-[10px] font-extrabold uppercase mb-4 tracking-widest ml-1"
      style={{ color, marginTop }}
    >
      {label}
    </Text>
  );
}
