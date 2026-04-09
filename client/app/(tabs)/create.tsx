import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomAlert } from '@/components/CustomAlert';
import { LocationSearchModal } from '@/features/trips/components/LocationSearchModal';
import {
  CreateTripEditSkeleton,
  CreateTripForm,
  MapPickerModal,
} from '@/features/trips/components/create-trip';
import { useCreateScreen } from '@/features/trips/hooks/use-create-screen';
import type { LocationCoordinate, LocationSelection } from '@/features/trips/types/location';

type MapTarget = 'from' | 'to' | null;

const buildAddressFromCoordinate = (result?: Location.LocationGeocodedAddress | null) => {
  if (!result) {
    return '';
  }

  const parts = [
    result.name,
    result.street,
    result.district,
    result.city,
    result.region,
    result.postalCode,
  ].filter(Boolean);

  return Array.from(new Set(parts)).join(', ');
};

export default function CreateScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const primaryColor = useThemeColor({}, 'primary');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const [mapTarget, setMapTarget] = useState<MapTarget>(null);
  const [selectedMapCoordinate, setSelectedMapCoordinate] = useState<LocationCoordinate | null>(null);
  const [isResolvingMapSelection, setIsResolvingMapSelection] = useState(false);
  const [residenceCoordinate, setResidenceCoordinate] = useState<LocationCoordinate | null>(null);
  const [currentLocationCoordinate, setCurrentLocationCoordinate] = useState<LocationCoordinate | null>(null);

  const {
    date,
    description,
    errors,
    formatDate,
    formatTime,
    from,
    fromCoordinate,
    genderPreference,
    handleDescriptionFocus,
    handleInputFocus,
    handlePublish,
    hasLoadedEditTrip,
    isEditing,
    isEditTripLoading,
    isPriceCalculated,
    maxTripDate,
    navigateToPublishedTrip,
    onDateChange,
    onTimeChange,
    price,
    profile,
    publishedTrip,
    publishMutation,
    router,
    scrollViewRef,
    seats,
    setDescription,
    setErrorForField,
    setFrom,
    setFromCoordinate,
    setGenderPreference,
    setIsPriceCalculated,
    setPrice,
    setSeats,
    setShowDatePicker,
    setShowFromPicker,
    setShowProfileAlert,
    setShowTimePicker,
    setShowToPicker,
    setTo,
    setToCoordinate,
    shareViaText,
    shareViaWhatsApp,
    showDatePicker,
    showFromPicker,
    showProfileAlert,
    showSharePrompt,
    showTimePicker,
    showToPicker,
    time,
    to,
    toCoordinate,
    today,
  } = useCreateScreen();

  useEffect(() => {
    let isMounted = true;

    const resolveResidenceCoordinate = async () => {
      if (!profile?.city?.trim()) {
        return;
      }

      try {
        const results = await Location.geocodeAsync(profile.city.trim());
        const first = results[0];
        if (isMounted && first) {
          setResidenceCoordinate({
            latitude: first.latitude,
            longitude: first.longitude,
          });
        }
      } catch {
        // Keep the map fallback if geocoding the user's city fails.
      }
    };

    resolveResidenceCoordinate();

    return () => {
      isMounted = false;
    };
  }, [profile?.city]);

  const handleLocationSelected = (target: Exclude<MapTarget, null>, selection: LocationSelection) => {
    const coordinate = selection.latitude != null && selection.longitude != null
      ? { latitude: selection.latitude, longitude: selection.longitude }
      : null;

    if (target === 'from') {
      setFrom(selection.address);
      setFromCoordinate(coordinate);
      setErrorForField('from', undefined);
      return;
    }

    setTo(selection.address);
    setToCoordinate(coordinate);
    setErrorForField('to', undefined);
  };

  const handleConfirmMapSelection = async () => {
    if (!mapTarget || !selectedMapCoordinate) {
      return;
    }

    try {
      setIsResolvingMapSelection(true);
      const geocodeResults = await Location.reverseGeocodeAsync(selectedMapCoordinate);
      const resolvedAddress = buildAddressFromCoordinate(geocodeResults[0])
        || `Pinned location (${selectedMapCoordinate.latitude.toFixed(5)}, ${selectedMapCoordinate.longitude.toFixed(5)})`;

      handleLocationSelected(mapTarget, {
        address: resolvedAddress,
        latitude: selectedMapCoordinate.latitude,
        longitude: selectedMapCoordinate.longitude,
      });
      setMapTarget(null);
      setSelectedMapCoordinate(null);
    } finally {
      setIsResolvingMapSelection(false);
    }
  };

  const handleShowMyLocation = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCurrentLocationCoordinate({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch {
      // Leave the current map focus unchanged if location lookup fails.
    }
  };

  if (isEditing && isEditTripLoading && !hasLoadedEditTrip) {
    return (
      <CreateTripEditSkeleton
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        cardColor={cardColor}
      />
    );
  }

  return (
    <>
      <LocationSearchModal
        visible={showFromPicker}
        onClose={() => setShowFromPicker(false)}
        onSelectLocation={(selection) => handleLocationSelected('from', selection)}
        title="Pickup Point"
        allowCurrentLocation
      />

      <LocationSearchModal
        visible={showToPicker}
        onClose={() => setShowToPicker(false)}
        onSelectLocation={(selection) => handleLocationSelected('to', selection)}
        title="Drop Destination"
      />

      <MapPickerModal
        visible={mapTarget !== null}
        title={mapTarget === 'from' ? 'Pickup Map Picker' : 'Drop Map Picker'}
        confirmLabel={mapTarget === 'from' ? 'Use Pickup Point' : 'Use Drop Point'}
        onClose={() => {
          setMapTarget(null);
          setSelectedMapCoordinate(null);
        }}
        onConfirm={handleConfirmMapSelection}
        onSelectCoordinate={setSelectedMapCoordinate}
        selectedCoordinate={selectedMapCoordinate}
        isResolvingSelection={isResolvingMapSelection}
        fromCoordinate={mapTarget === 'from' ? selectedMapCoordinate ?? fromCoordinate : fromCoordinate}
        toCoordinate={mapTarget === 'to' ? selectedMapCoordinate ?? toCoordinate : toCoordinate}
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        cardColor={cardColor}
        primaryColor={primaryColor}
        textColor={textColor}
      />

      <CustomAlert
        visible={showProfileAlert}
        title="Incomplete Profile"
        message={`You need to provide your full details before you can ${isEditing ? 'edit' : 'publish'} a ride.`}
        primaryButton={{
          text: 'Go to Profile',
          onPress: () => {
            setShowProfileAlert(false);
            router.push({ pathname: '/(tabs)/profile', params: { openEditor: 'true' } });
          },
        }}
        onClose={() => setShowProfileAlert(false)}
        icon="person.crop.circle.badge.exclamationmark"
        dismissible={false}
      />

      <CustomAlert
        visible={showSharePrompt}
        title="Ride is Live! 🚀"
        message={
          publishedTrip
            ? `Your route from ${publishedTrip.startingPoint} to ${publishedTrip.destination} is now public. Share it with your community.`
            : 'Your ride is live. Share it now through WhatsApp or text.'
        }
        primaryButton={{
          text: 'WhatsApp',
          onPress: shareViaWhatsApp,
        }}
        secondaryButton={{
          text: 'Later',
          onPress: () => navigateToPublishedTrip(),
        }}
        tertiaryButton={{
          text: 'Direct Text',
          onPress: shareViaText,
        }}
        onClose={() => navigateToPublishedTrip()}
        icon="paperplane.fill"
      />

      <CreateTripForm
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        cardColor={cardColor}
        currentLocationCoordinate={currentLocationCoordinate}
        date={date}
        description={description}
        errors={errors}
        formatDate={formatDate}
        formatTime={formatTime}
        from={from}
        fromCoordinate={fromCoordinate}
        genderPreference={genderPreference}
        handleDescriptionFocus={handleDescriptionFocus}
        handleInputFocus={handleInputFocus}
        handlePublish={handlePublish}
        isEditing={isEditing}
        isPriceCalculated={isPriceCalculated}
        isPublishing={publishMutation.isPending}
        maxTripDate={maxTripDate}
        onDateChange={onDateChange}
        onDescriptionChange={(text) => {
          setDescription(text);
          setErrorForField('description', undefined);
        }}
        onGenderPreferenceChange={setGenderPreference}
        onPriceChange={(text) => {
          setPrice(text.replace(/[^0-9.]/g, ''));
          setErrorForField('price', undefined);
        }}
        onPriceCalculatedChange={(value) => {
          setIsPriceCalculated(value);
          if (value) {
            setPrice('');
            setErrorForField('price', undefined);
          }
        }}
        onSeatsChange={(text) => {
          setSeats(text.replace(/[^0-9]/g, ''));
          setErrorForField('seats', undefined);
        }}
        onShowDatePicker={() => setShowDatePicker(true)}
        onShowFromPicker={() => setShowFromPicker(true)}
        onShowMyLocation={handleShowMyLocation}
        onShowFromMapPicker={() => {
          setSelectedMapCoordinate(fromCoordinate);
          setMapTarget('from');
        }}
        onShowTimePicker={() => setShowTimePicker(true)}
        onShowToPicker={() => setShowToPicker(true)}
        onShowToMapPicker={() => {
          setSelectedMapCoordinate(toCoordinate);
          setMapTarget('to');
        }}
        onTimeChange={onTimeChange}
        primaryColor={primaryColor}
        price={price}
        residenceCoordinate={residenceCoordinate}
        scrollViewRef={scrollViewRef}
        seats={seats}
        showDatePicker={showDatePicker}
        showTimePicker={showTimePicker}
        subtextColor={subtextColor}
        textColor={textColor}
        time={time}
        to={to}
        toCoordinate={toCoordinate}
        today={today}
      />
    </>
  );
}
