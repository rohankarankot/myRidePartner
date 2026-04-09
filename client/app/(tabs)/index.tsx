import { FlatList, RefreshControl } from 'react-native';
import { BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import { Tabs, useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { FilterBottomSheet } from '@/features/trips/components/FilterBottomSheet';
import { Box } from '@/components/ui/box';
import { FindRidesSkeleton } from '@/features/trips/components/FindRidesSkeleton';
import {
  CityOption,
  CitySelectorTrigger,
  CitySheetHeader,
  FindRidesEmptyState,
  FindRidesFilterFab,
  FindRidesHeader,
  FindRidesListFooter,
  TripCard,
} from '@/features/trips/components/find-rides';
import { useFindRidesScreen } from '@/features/trips/hooks/use-find-rides-screen';

export default function FindRidesScreen() {
  const router = useRouter();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  const {
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
    openCitySheet,
    openFilters,
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
  } = useFindRidesScreen();

  return (
    <Box className="flex-1" style={{ backgroundColor }}>
      <Tabs.Screen
        options={{
          headerLeft: () => (
            <CitySelectorTrigger
              borderColor={borderColor}
              cardColor={cardColor}
              onPress={openCitySheet}
              primaryColor={primaryColor}
              selectedCity={selectedCity}
              subtextColor={subtextColor}
              textColor={textColor}
            />
          ),
        }}
      />

      <Box className="px-5 pt-5">
        <FindRidesHeader
          borderColor={borderColor}
          cardColor={cardColor}
          date={date}
          fromSearch={fromSearch}
          hasActiveRouteSearch={hasActiveRouteSearch}
          showRouteInputs={trips.length > 0 || hasActiveRouteSearch}
          onFromSearchChange={setFromSearch}
          onToSearchChange={setToSearch}
          primaryColor={primaryColor}
          searchInputRef={searchInputRef}
          selectedCity={selectedCity}
          subtextColor={subtextColor}
          textColor={textColor}
          toSearch={toSearch}
        />
      </Box>

      {showInitialLoading ? (
        <FindRidesSkeleton />
      ) : (
        <FlatList
          ref={listRef}
          data={trips}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TripCard
              avatarUrl={
                typeof item.creator?.userProfile?.avatar === 'string'
                  ? item.creator.userProfile.avatar
                  : (item.creator?.userProfile?.avatar as { url?: string } | undefined)?.url
              }
              captainName={item.creator?.userProfile?.fullName || item.creator?.username}
              date={item.date}
              documentId={item.documentId}
              from={item.startingPoint}
              genderPreference={item.genderPreference}
              isCalculated={item.isPriceCalculated}
              onPress={(id) => router.push(`/trip/${id}`)}
              price={item.pricePerSeat?.toString()}
              status={item.status}
              time={item.time}
              to={item.destination}
            />
          )}
          ListFooterComponent={
            <FindRidesListFooter isFetchingNextPage={isFetchingNextPage} primaryColor={primaryColor} />
          }
          ListEmptyComponent={
            !showInitialLoading ? (
              <FindRidesEmptyState
                date={date}
                gender={gender}
                hasActiveRouteSearch={hasActiveRouteSearch}
                onClearFilters={resetFilters}
                onCreateRide={() => router.push('/create')}
                primaryColor={primaryColor}
                selectedCity={selectedCity}
                subtextColor={subtextColor}
                textColor={textColor}
              />
            ) : null
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onEndReached={loadMoreTrips}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refreshTrips}
              tintColor={primaryColor}
            />
          }
        />
      )}

      <FindRidesFilterFab onPress={openFilters} primaryColor={primaryColor} />

      <FilterBottomSheet
        ref={filterSheetRef}
        gender={gender}
        setGender={setGender}
        date={date}
        setDate={setDate}
        onApply={applyFilters}
        onReset={resetFilters}
      />

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
          ListHeaderComponent={
            <CitySheetHeader
              borderColor={borderColor}
              cardColor={cardColor}
              citySearch={citySearch}
              onCitySearchChange={setCitySearch}
              subtextColor={subtextColor}
              textColor={textColor}
            />
          }
          renderItem={({ item }: { item: string }) => (
            <CityOption
              isActive={item === selectedCity}
              item={item}
              onPress={() => selectCity(item)}
              primaryColor={primaryColor}
              subtextColor={subtextColor}
              textColor={textColor}
            />
          )}
          contentContainerStyle={{ paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        />
      </BottomSheetModal>
    </Box>
  );
}
