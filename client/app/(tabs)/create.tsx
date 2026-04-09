import React from 'react';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomAlert } from '@/components/CustomAlert';
import { LocationSearchModal } from '@/features/trips/components/LocationSearchModal';
import {
  CreateTripEditSkeleton,
  CreateTripForm,
} from '@/features/trips/components/create-trip';
import { useCreateScreen } from '@/features/trips/hooks/use-create-screen';

export default function CreateScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const primaryColor = useThemeColor({}, 'primary');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  const {
    date,
    description,
    errors,
    formatDate,
    formatTime,
    from,
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
    publishedTrip,
    publishMutation,
    router,
    scrollViewRef,
    seats,
    setDescription,
    setErrorForField,
    setFrom,
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
    today,
  } = useCreateScreen();

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
        onSelectLocation={(address: string) => {
          setFrom(address);
          setErrorForField('from', undefined);
        }}
        title="Pickup Point"
        allowCurrentLocation
      />

      <LocationSearchModal
        visible={showToPicker}
        onClose={() => setShowToPicker(false)}
        onSelectLocation={(address: string) => {
          setTo(address);
          setErrorForField('to', undefined);
        }}
        title="Drop Destination"
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
        date={date}
        description={description}
        errors={errors}
        formatDate={formatDate}
        formatTime={formatTime}
        from={from}
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
        onShowTimePicker={() => setShowTimePicker(true)}
        onShowToPicker={() => setShowToPicker(true)}
        onTimeChange={onTimeChange}
        primaryColor={primaryColor}
        price={price}
        scrollViewRef={scrollViewRef}
        seats={seats}
        showDatePicker={showDatePicker}
        showTimePicker={showTimePicker}
        subtextColor={subtextColor}
        textColor={textColor}
        time={time}
        to={to}
        today={today}
      />
    </>
  );
}
