import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Switch } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { CreateTripFormErrors, CREATE_TRIP_GENDER_OPTIONS } from '@/features/trips/utils/create-trip';
import { CreateTripFormField } from '@/features/trips/components/create-trip/CreateTripFormField';

type CreateTripFormProps = {
  backgroundColor: string;
  borderColor: string;
  cardColor: string;
  date: Date;
  description: string;
  errors: CreateTripFormErrors;
  formatDate: (value: Date) => string;
  formatTime: (value: Date) => string;
  from: string;
  genderPreference: 'men' | 'women' | 'both';
  handleDescriptionFocus: () => void;
  handleInputFocus: (offset?: number) => void;
  handleNextStep: () => boolean;
  handlePublish: () => void;
  isEditing: boolean;
  isPriceCalculated: boolean;
  isPublishing: boolean;
  maxTripDate: Date;
  onDateChange: (event: any, selectedDate?: Date) => void;
  onDescriptionChange: (text: string) => void;
  onGenderPreferenceChange: (value: 'men' | 'women' | 'both') => void;
  onPriceChange: (text: string) => void;
  onPriceCalculatedChange: (value: boolean) => void;
  onSeatsChange: (text: string) => void;
  onShowDatePicker: () => void;
  onShowFromPicker: () => void;
  onShowTimePicker: () => void;
  onShowToPicker: () => void;
  onTimeChange: (event: any, selectedDate?: Date) => void;
  primaryColor: string;
  price: string;
  scrollViewRef: React.RefObject<ScrollView | null>;
  seats: string;
  showDatePicker: boolean;
  showTimePicker: boolean;
  subtextColor: string;
  textColor: string;
  time: Date;
  to: string;
  today: Date;
};

export function CreateTripForm({
  backgroundColor,
  borderColor,
  cardColor,
  date,
  description,
  errors,
  formatDate,
  formatTime,
  from,
  genderPreference,
  handleDescriptionFocus,
  handleInputFocus,
  handleNextStep,
  handlePublish,
  isEditing,
  isPriceCalculated,
  isPublishing,
  maxTripDate,
  onDateChange,
  onDescriptionChange,
  onGenderPreferenceChange,
  onPriceChange,
  onPriceCalculatedChange,
  onSeatsChange,
  onShowDatePicker,
  onShowTimePicker,
  onTimeChange,
  onShowFromPicker,
  onShowToPicker,
  primaryColor,
  price,
  scrollViewRef,
  seats,
  showDatePicker,
  showTimePicker,
  subtextColor,
  textColor,
  time,
  to,
  today,
}: CreateTripFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const canMoveToDetails = Boolean(from.trim()) && Boolean(to.trim());
  const handleGoToDetailsStep = () => {
    if (handleNextStep()) {
      setStep(2);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >


      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        style={{ flex: 1 }}
      >
        {step === 2 ? (
          <VStack space="xs" className="mb-4 mt-4 px-4">
            <Text className="text-xl font-extrabold" style={{ color: textColor }}>
              Fill the other details
            </Text>
            <Text className="text-sm leading-6" style={{ color: subtextColor }}>
              Add timing, seats, pricing, and trip preferences before publishing.
            </Text>
          </VStack>
        ) : null}

        <Box
          className={`mb-8 rounded-[20px] border p-5 mt-4`}
          style={{ backgroundColor: cardColor, borderColor }}
        >
          <Box className="mt-2">
            <HStack className="mb-5 items-center justify-between">
              <VStack space="xs">
                <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
                  Step {step} of 2
                </Text>
                <Text className="text-lg font-bold" style={{ color: textColor }}>
                  {step === 1 ? 'Choose your route' : 'Add trip details'}
                </Text>
              </VStack>
              <HStack space="sm">
                <Box
                  className="h-2 w-10 rounded-full"
                  style={{ backgroundColor: step >= 1 ? primaryColor : borderColor }}
                />
                <Box
                  className="h-2 w-10 rounded-full"
                  style={{ backgroundColor: step >= 2 ? primaryColor : borderColor }}
                />
              </HStack>
            </HStack>

            {step === 1 ? (
              <VStack space="sm">
                <VStack space="sm" className="mt-1">
                  <CreateTripFormField
                    label="Starting Point"
                    placeholder="Search pickup location..."
                    icon="house.fill"
                    value={from}
                    error={errors.from}
                    onPress={onShowFromPicker}
                    multiline
                    compactMultiline
                    numberOfLines={3}
                  />
                </VStack>

                <VStack space="sm" className="mt-1">
                  <CreateTripFormField
                    label="Destination"
                    placeholder="Search drop location..."
                    icon="location.fill"
                    value={to}
                    error={errors.to}
                    onPress={onShowToPicker}
                    multiline
                    compactMultiline
                    numberOfLines={3}
                  />
                </VStack>




                <Button
                  className="mt-4 h-14 rounded-2xl"
                  style={{ backgroundColor: primaryColor, opacity: canMoveToDetails ? 1 : 0.6 }}
                  onPress={handleGoToDetailsStep}
                  disabled={!canMoveToDetails}
                >
                  <HStack space="md" className="items-center">
                    <ButtonText className="text-base font-extrabold uppercase tracking-widest text-white">
                      Next
                    </ButtonText>
                    <IconSymbol name="arrow.right" size={18} color="white" />
                  </HStack>
                </Button>
              </VStack>
            ) : (
              <>
                <VStack space="md">
                  <CreateTripFormField
                    label="Date"
                    placeholder="Ride Date"
                    icon="calendar"
                    value={formatDate(date)}
                    error={errors.date}
                    onPress={onShowDatePicker}
                  />
                  <CreateTripFormField
                    label="Time"
                    placeholder="Ride Time"
                    icon="clock.fill"
                    value={formatTime(time)}
                    error={errors.time}
                    onPress={onShowTimePicker}
                  />
                </VStack>

                {showDatePicker ? (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                    minimumDate={today}
                    maximumDate={maxTripDate}
                  />
                ) : null}

                {showTimePicker ? (
                  <DateTimePicker
                    value={time}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onTimeChange}
                  />
                ) : null}

                <CreateTripFormField
                  label="Available Seats"
                  placeholder="Min 1, Max 4"
                  icon="person.fill"
                  value={seats}
                  error={errors.seats}
                  onChangeText={onSeatsChange}
                  onFocus={() => handleInputFocus(400)}
                  keyboardType="numeric"
                />

                <VStack space="md" className="mb-10">
                  <HStack className="items-center justify-between px-1">
                    <VStack className="flex-1">
                      <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
                        Fare Logic
                      </Text>
                      <Text className="text-sm font-bold" style={{ color: textColor }}>
                        Auto-calculate expenses
                      </Text>
                    </VStack>
                    <Switch
                      value={isPriceCalculated}
                      onValueChange={onPriceCalculatedChange}
                      trackColor={{ false: borderColor, true: primaryColor }}
                    />
                  </HStack>

                  {!isPriceCalculated ? (
                    <Box className="mt-4">
                      <CreateTripFormField
                        label="Fixed Price per Seat (₹)"
                        placeholder="e.g. 200"
                        icon="indianrupeesign.circle.fill"
                        value={price}
                        error={errors.price}
                        onChangeText={onPriceChange}
                        onFocus={() => handleInputFocus(600)}
                        keyboardType="numeric"
                      />
                    </Box>
                  ) : null}
                </VStack>

                <CreateTripFormField
                  label="Trip Bio & Ground Rules"
                  placeholder="Tell riders about luggage, music, or stopovers..."
                  icon="doc.text.fill"
                  value={description}
                  error={errors.description}
                  onChangeText={onDescriptionChange}
                  multiline
                  numberOfLines={5}
                  onFocus={handleDescriptionFocus}
                />

                <Box className="mt-2 mb-2" />

                <VStack space="sm" className="mb-6">
                  <Text className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: subtextColor }}>
                    Gender Preference
                  </Text>
                  <HStack space="md">
                    {CREATE_TRIP_GENDER_OPTIONS.map((option) => {
                      const active = genderPreference === option.key;
                      return (
                        <Pressable
                          key={option.key}
                          className="flex-1 h-12 rounded-2xl border-2 items-center justify-center"
                          style={{
                            borderColor: active ? primaryColor : borderColor,
                            backgroundColor: active ? primaryColor : 'transparent',
                          }}
                          onPress={() => onGenderPreferenceChange(option.key)}
                        >
                          <Text
                            className="text-[10px] font-extrabold uppercase tracking-widest text-center"
                            style={{ color: active ? '#fff' : textColor }}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </HStack>
                </VStack>

                <HStack space="sm" className="mt-4">
                  <Pressable
                    className="h-14 flex-1 rounded-2xl items-center justify-center border"
                    style={{ borderColor, backgroundColor }}
                    onPress={() => setStep(1)}
                  >
                    <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: textColor }}>
                      Back
                    </Text>
                  </Pressable>
                  <Button
                    className="h-14 flex-[2] rounded-2xl"
                    style={{
                      backgroundColor: primaryColor,
                      opacity: isPublishing ? 0.8 : 1,
                    }}
                    onPress={handlePublish}
                    disabled={isPublishing}
                  >
                    {isPublishing ? (
                      <Spinner color="#fff" />
                    ) : (
                      <HStack space="md" className="items-center">
                        <ButtonText className="text-base font-extrabold uppercase tracking-widest text-white">
                          {isEditing ? 'Update Ride' : 'Publish Ride'}
                        </ButtonText>
                        <IconSymbol name="paperplane.fill" size={18} color="white" />
                      </HStack>
                    )}
                  </Button>
                </HStack>
              </>
            )}
          </Box>
        </Box>

        {step === 2 ? (
          <>
            <VStack className="items-center px-6 mb-6" space="xs">
              <IconSymbol name="shield.lefthalf.filled" size={24} color={primaryColor} />
              <Text className="text-[10px] font-extrabold uppercase tracking-widest text-center leading-4" style={{ color: subtextColor }}>
                By publishing, you commit to split costs fairly and adhering to the community guidelines.
              </Text>
            </VStack>
          </>
        ) : null}

        <Box className="h-20" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
