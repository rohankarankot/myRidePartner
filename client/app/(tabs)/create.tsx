import React from 'react';
import { Text as NativeText } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomAlert } from '@/components/CustomAlert';
import { LocationSearchModal } from '@/features/trips/components/LocationSearchModal';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  CreateTripEditSkeleton,
  CreateTripForm,
} from '@/features/trips/components/create-trip';
import { useCreateScreen } from '@/features/trips/hooks/use-create-screen';
import type { LocationSelection } from '@/features/trips/types/location';



export default function CreateScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const primaryColor = useThemeColor({}, 'primary');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  const shareCardColor = `${primaryColor}08`;


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
    validateRouteStep,
    hasLoadedEditTrip,
    isEditing,
    isEditTripLoading,
    isPriceCalculated,
    maxTripDate,
    navigateToPublishedTrip,
    onDateChange,
    onTimeChange,
    openTimePicker,
    price,
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
    today,
  } = useCreateScreen();



  const handleLocationSelected = (target: 'from' | 'to', selection: LocationSelection) => {
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
            ? 'Your ride is now public.'
            : 'Your ride is live. Share it now through WhatsApp or text.'
        }
        primaryButton={{
          text: 'WhatsApp',
          onPress: shareViaWhatsApp,
          icon: 'whatsapp.logo',
        }}
        secondaryButton={{
          text: 'Later',
          onPress: () => navigateToPublishedTrip(),
        }}
        tertiaryButton={{
          text: 'Text',
          onPress: shareViaText,
          icon: 'message.fill',
        }}
        onClose={() => navigateToPublishedTrip()}
        icon="paperplane.fill"
      >
        {publishedTrip ? (
          <Box
            className="w-full rounded-[24px] border p-4"
            style={{ backgroundColor: shareCardColor, borderColor }}
          >
            <HStack space="md" className="items-stretch">
              <VStack className="items-center py-1">
                <Box className="h-3 w-3 rounded-full" style={{ backgroundColor: primaryColor }} />
                <Box className="w-px flex-1 my-2 min-h-8" style={{ backgroundColor: borderColor }} />
                <Box className="h-3 w-3 rounded-full" style={{ backgroundColor: '#10B981' }} />
              </VStack>
              <VStack className="flex-1" space="lg">
                <VStack space="xs">
                  <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
                    Pickup
                  </Text>
                  <NativeText
                    numberOfLines={3}
                    style={{ color: textColor, fontSize: 14, fontWeight: '600', lineHeight: 20 }}
                  >
                    {publishedTrip.startingPoint}
                  </NativeText>
                </VStack>
                <VStack space="xs">
                  <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
                    Destination
                  </Text>
                  <NativeText
                    numberOfLines={3}
                    style={{ color: textColor, fontSize: 14, fontWeight: '600', lineHeight: 20 }}
                  >
                    {publishedTrip.destination}
                  </NativeText>
                </VStack>
              </VStack>
            </HStack>
          </Box>
        ) : null}
      </CustomAlert>

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
        handleNextStep={validateRouteStep}
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
        onShowTimePicker={openTimePicker}
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
