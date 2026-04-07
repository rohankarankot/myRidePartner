import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Switch,
  KeyboardAvoidingView,
  Linking,
  Share,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/auth-context';
import { tripService } from '@/services/trip-service';
import { LocationSearchModal } from '@/components/LocationSearchModal';
import { useUserStore } from '@/store/user-store';
import { CustomAlert } from '@/components/CustomAlert';
import { joinRequestService } from '@/services/join-request-service';
import {
  buildTripStartDateTime,
  canCaptainEditTrip,
} from '@/features/trips/utils/trip-editability';
import { buildTripShareMessage } from '@/features/trips/utils/trip-share';
import { Trip } from '@/types/api';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Pressable } from '@/components/ui/pressable';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Divider } from '@/components/ui/divider';
import { Spinner } from '@/components/ui/spinner';

type FormErrors = Partial<
  Record<'from' | 'to' | 'date' | 'time' | 'seats' | 'price' | 'description', string>
>;

const getStartOfDay = (value: Date) => {
  const next = new Date(value);
  next.setHours(0, 0, 0, 0);
  return next;
};

const addDays = (value: Date, days: number) => {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
};

function FormField({
  label,
  placeholder,
  icon,
  value,
  onChangeText,
  keyboardType = 'default',
  editable = true,
  onPress,
  multiline = false,
  numberOfLines = 1,
  error,
}: {
  label: string;
  placeholder: string;
  icon: any;
  value: string;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'numeric';
  editable?: boolean;
  onPress?: () => void;
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
}) {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const borderColor = useThemeColor({}, 'border');
  const dangerColor = useThemeColor({}, 'danger');

  return (
    <VStack space="xs" style={styles.fieldContainer}>
      <Text className="text-sm font-semibold" style={{ color: textColor }}>
        {label}
      </Text>
      <TouchableOpacity
        activeOpacity={onPress ? 0.7 : 1}
        onPress={onPress}
        style={[
          styles.inputContainer,
          {
            borderColor: error ? dangerColor : borderColor,
            backgroundColor: 'rgba(0,0,0,0.02)',
            minHeight: multiline ? 120 : 52,
            alignItems: multiline ? 'flex-start' : 'center',
            paddingTop: multiline ? 14 : 0,
          },
        ]}
      >
        <IconSymbol
          name={icon}
          size={18}
          color={subtextColor}
          style={{ marginTop: multiline ? 4 : 0 }}
        />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={subtextColor}
          style={[
            styles.input,
            {
              color: textColor,
              textAlignVertical: multiline ? 'top' : 'center',
              minHeight: multiline ? 90 : undefined,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          editable={editable && !onPress}
          pointerEvents={onPress ? 'none' : 'auto'}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
      </TouchableOpacity>
      {error ? (
        <Text className="text-xs font-medium" style={{ color: dangerColor }}>
          {error}
        </Text>
      ) : null}
    </VStack>
  );
}

export default function CreateScreen() {
  const { editTripId } = useLocalSearchParams<{ editTripId?: string }>();
  const isEditing = typeof editTripId === 'string' && editTripId.length > 0;
  const today = getStartOfDay(new Date());
  const maxTripDate = addDays(today, 2);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(today);
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [seats, setSeats] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isPriceCalculated, setIsPriceCalculated] = useState(true);
  const [genderPreference, setGenderPreference] = useState<'men' | 'women' | 'both'>('both');
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [showProfileAlert, setShowProfileAlert] = useState(false);
  const [showSharePrompt, setShowSharePrompt] = useState(false);
  const [publishedTrip, setPublishedTrip] = useState<Trip | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasLoadedEditTrip, setHasLoadedEditTrip] = useState(false);

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = getStartOfDay(selectedDate || date);
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
    setErrors((current) => ({ ...current, date: undefined }));
  };

  const onTimeChange = (_event: DateTimePickerEvent, selectedTime?: Date) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(Platform.OS === 'ios');
    setTime(currentTime);
    setErrors((current) => ({ ...current, time: undefined }));
  };

  const formatDate = (value: Date) => format(value, 'yyyy-MM-dd');

  const formatTime = (value: Date) =>
    value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  const validateForm = () => {
    const nextErrors: FormErrors = {};
    const trimmedFrom = from.trim();
    const trimmedTo = to.trim();
    const trimmedDescription = description.trim();
    const numericSeats = Number(seats);
    const numericPrice = Number(price);
    const selectedDate = getStartOfDay(date);
    const selectedDateTime = new Date(date);
    selectedDateTime.setHours(time.getHours(), time.getMinutes(), 0, 0);
    const now = new Date();

    if (!trimmedFrom) {
      nextErrors.from = 'Starting point is required.';
    } else if (trimmedFrom.length > 20) {
      nextErrors.from = 'Starting point must be 20 characters or less.';
    }

    if (!trimmedTo) {
      nextErrors.to = 'Destination is required.';
    } else if (trimmedTo.length > 20) {
      nextErrors.to = 'Destination must be 20 characters or less.';
    }

    if (selectedDate < today || selectedDate > maxTripDate) {
      nextErrors.date = 'Ride date must be within the next 3 days.';
    }

    if (selectedDateTime.getTime() <= now.getTime()) {
      nextErrors.time = 'Ride time must be in the future.';
    }

    if (!seats.trim()) {
      nextErrors.seats = 'Available seats is required.';
    } else if (!Number.isInteger(numericSeats) || numericSeats < 1) {
      nextErrors.seats = 'Available seats must be at least 1.';
    } else if (numericSeats > 4) {
      nextErrors.seats = 'You can only publish a ride with up to 4 seats.';
    }

    if (!isPriceCalculated) {
      if (!price.trim()) {
        nextErrors.price = 'Price per seat is required when auto-calculate is off.';
      } else if (Number.isNaN(numericPrice)) {
        nextErrors.price = 'Price per seat must be a valid number.';
      } else if (numericPrice > 1000) {
        nextErrors.price = 'Price per seat must be 1000 or less.';
      } else if (numericPrice < 0) {
        nextErrors.price = 'Price per seat cannot be negative.';
      }
    }

    if (trimmedDescription.length > 200) {
      nextErrors.description = 'Trip description must be 200 characters or less.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile } = useUserStore();

  const isProfileIncomplete =
    !profile || !profile.fullName || !profile.phoneNumber || !profile.gender || !profile.city;

  useFocusEffect(
    React.useCallback(() => {
      if (isProfileIncomplete) {
        setShowProfileAlert(true);
      }
    }, [isProfileIncomplete])
  );

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const primaryColor = useThemeColor({}, 'primary');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  const { data: editableTripData, isLoading: isEditTripLoading } = useQuery({
    queryKey: ['editable-trip', editTripId, user?.id],
    enabled: isEditing && !!editTripId && !!user,
    queryFn: async () => {
      const [trip, requests] = await Promise.all([
        tripService.getTripById(editTripId as string),
        joinRequestService.getJoinRequestsForTrip(editTripId as string),
      ]);

      return { trip, requests };
    },
  });

  useEffect(() => {
    if (!isEditing || !editableTripData || hasLoadedEditTrip) {
      return;
    }

    const { trip, requests } = editableTripData;
    const canEditTrip = canCaptainEditTrip({
      trip,
      joinRequests: requests,
      currentUserId: user?.id,
    });

    if (!canEditTrip) {
      Toast.show({
        type: 'error',
        text1: 'Trip can’t be edited',
        text2: 'Editing is only allowed before the trip starts and before any passenger is approved.',
      });
      router.replace(`/trip/${editTripId}`);
      return;
    }

    setFrom(trip.startingPoint);
    setTo(trip.destination);
    setDate(getStartOfDay(new Date(`${trip.date}T00:00:00`)));
    setTime(buildTripStartDateTime(trip.date, trip.time));
    setSeats(String(trip.availableSeats));
    setPrice(trip.pricePerSeat != null ? String(trip.pricePerSeat) : '');
    setDescription(trip.description || '');
    setIsPriceCalculated(trip.isPriceCalculated);
    setGenderPreference(trip.genderPreference);
    setErrors({});
    setHasLoadedEditTrip(true);
  }, [editableTripData, editTripId, hasLoadedEditTrip, isEditing, router, user?.id]);

  const resetForm = () => {
    setFrom('');
    setTo('');
    setDate(today);
    setTime(new Date());
    setSeats('');
    setPrice('');
    setDescription('');
    setIsPriceCalculated(true);
    setGenderPreference('both');
    setErrors({});
  };

  const publishMutation = useMutation({
    mutationFn: async (tripData: any) =>
      isEditing
        ? tripService.updateTrip(editTripId as string, tripData)
        : tripService.createTrip(tripData),
    onSuccess: (savedTrip) => {
      queryClient.invalidateQueries({ queryKey: ['trips', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['all-trips-paged'] });
      queryClient.invalidateQueries({ queryKey: ['trip-details', savedTrip.documentId] });

      Toast.show({
        type: 'success',
        text1: isEditing ? 'Ride Updated' : 'Ride Published! 🚗',
        text2: isEditing
          ? 'Your ride changes have been saved.'
          : 'Your ride has been successfully published.',
      });

      if (isEditing) {
        setTimeout(() => {
          router.replace(`/trip/${savedTrip.documentId}`);
        }, 1000);
        return;
      }

      setPublishedTrip(savedTrip);
      setShowSharePrompt(true);
      resetForm();
    },
    onError: (error) => {
      console.error(isEditing ? 'Update trip error:' : 'Publish error:', error);
      const apiMessage = (error as any)?.response?.data?.message;
      const fallbackMessage = Array.isArray(apiMessage)
        ? apiMessage[0]
        : typeof apiMessage === 'string'
          ? apiMessage
          : isEditing
            ? 'Failed to update ride. Please try again.'
            : 'Failed to publish ride. Please try again.';

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: fallbackMessage,
      });
    },
  });

  const handlePublish = async () => {
    if (isProfileIncomplete) {
      Toast.show({
        type: 'error',
        text1: 'Profile Incomplete',
        text2: 'Please update your profile details to publish a ride.',
      });
      router.push('/(tabs)/profile');
      return;
    }

    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'You must be logged in to publish a ride.',
      });
      return;
    }

    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Please fix the highlighted fields',
        text2: `Your ride details need a few corrections before ${isEditing ? 'saving' : 'publishing'}.`,
      });
      return;
    }

    const tripPayload = {
      startingPoint: from.trim(),
      destination: to.trim(),
      date: formatDate(date),
      time: formatTime(time),
      description: description.trim() || undefined,
      availableSeats: parseInt(seats, 10),
      city: profile?.city,
      pricePerSeat: isPriceCalculated ? null : parseFloat(price),
      isPriceCalculated,
      genderPreference,
      ...(isEditing ? {} : { creator: user.id }),
    };

    publishMutation.mutate(tripPayload);
  };

  const navigateToPublishedTrip = (tripDocumentId?: string) => {
    setShowSharePrompt(false);
    const targetTripId = tripDocumentId || publishedTrip?.documentId;
    if (targetTripId) {
      router.replace(`/trip/${targetTripId}`);
    } else {
      router.replace('/(tabs)/activity');
    }
  };

  const shareViaWhatsApp = async () => {
    if (!publishedTrip) return;

    const message = buildTripShareMessage(publishedTrip);
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;

    try {
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        await Share.share({ message });
        Toast.show({
          type: 'info',
          text1: 'WhatsApp not available',
          text2: 'Opened the regular share sheet instead.',
        });
      }
    } catch (error) {
      console.error('WhatsApp share failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Share failed',
        text2: 'Unable to open WhatsApp right now.',
      });
    } finally {
      navigateToPublishedTrip(publishedTrip.documentId);
    }
  };

  const shareViaText = async () => {
    if (!publishedTrip) return;

    const message = buildTripShareMessage(publishedTrip);
    const smsSeparator = Platform.OS === 'ios' ? '&' : '?';
    const smsUrl = `sms:${smsSeparator}body=${encodeURIComponent(message)}`;

    try {
      await Linking.openURL(smsUrl);
    } catch (error) {
      console.error('SMS share failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Text share failed',
        text2: 'Unable to open your messaging app right now.',
      });
    } finally {
      navigateToPublishedTrip(publishedTrip.documentId);
    }
  };

  if (isEditing && isEditTripLoading && !hasLoadedEditTrip) {
    return (
      <Box className="flex-1 items-center justify-center px-6" style={{ backgroundColor }}>
        <Spinner color={primaryColor} />
        <Text className="mt-3 text-sm" style={{ color: subtextColor }}>
          Loading trip details…
        </Text>
      </Box>
    );
  }

  const genderOptions = [
    { key: 'men' as const, label: 'Only Men' },
    { key: 'women' as const, label: 'Only Women' },
    { key: 'both' as const, label: 'Both' },
  ];

  return (
    <>
      <LocationSearchModal
        visible={showFromPicker}
        onClose={() => setShowFromPicker(false)}
        onSelectLocation={(address: string) => {
          setFrom(address);
          setErrors((current) => ({ ...current, from: undefined }));
        }}
        title="Select Starting Point"
      />

      <LocationSearchModal
        visible={showToPicker}
        onClose={() => setShowToPicker(false)}
        onSelectLocation={(address: string) => {
          setTo(address);
          setErrors((current) => ({ ...current, to: undefined }));
        }}
        title="Select Destination"
      />

      <CustomAlert
        visible={showProfileAlert}
        title="Complete Your Profile"
        message={`You need to provide your Name, Phone Number, Gender, and City before you can ${isEditing ? 'edit' : 'publish'} a ride.`}
        primaryButton={{
          text: 'Go to Profile',
          onPress: () => {
            setShowProfileAlert(false);
            router.push('/(tabs)/profile');
          },
        }}
        onClose={() => setShowProfileAlert(false)}
        icon="person.crop.circle.badge.exclamationmark"
        dismissible={false}
      />

      <CustomAlert
        visible={showSharePrompt}
        title="Share This Ride"
        message={
          publishedTrip
            ? `Your ride from ${publishedTrip.startingPoint} to ${publishedTrip.destination} is live. Share it now through WhatsApp or text.`
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
          text: 'Text',
          onPress: shareViaText,
        }}
        onClose={() => navigateToPublishedTrip()}
        icon="paperplane.fill"
      />

      <KeyboardAvoidingView
        style={[styles.safe, { backgroundColor }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <VStack space="sm">
            <Text className="text-3xl font-bold" style={{ color: textColor }}>
              {isEditing ? 'Edit Ride' : 'Publish Ride'}
            </Text>
            <Text className="text-sm leading-6" style={{ color: subtextColor }}>
              {isEditing
                ? 'You can update this trip until it starts, as long as no passenger has been approved yet.'
                : 'Share your route and timing so riders can request to join.'}
            </Text>
          </VStack>

          <Box
            className="rounded-3xl p-5 mt-5 mb-6"
            style={[styles.cardShadow, { backgroundColor: cardColor }]}
          >
            <FormField
              label="Starting Point"
              placeholder="Search pickup location..."
              icon="house.fill"
              value={from}
              error={errors.from}
              onPress={() => setShowFromPicker(true)}
            />

            <FormField
              label="Destination"
              placeholder="Search drop location..."
              icon="location.fill"
              value={to}
              error={errors.to}
              onPress={() => setShowToPicker(true)}
            />

            <HStack space="md">
              <Box className="flex-1">
                <FormField
                  label="Date"
                  placeholder="Select Date"
                  icon="calendar"
                  value={formatDate(date)}
                  error={errors.date}
                  onPress={() => setShowDatePicker(true)}
                />
              </Box>
              <Box className="flex-1">
                <FormField
                  label="Time"
                  placeholder="Select Time"
                  icon="clock.fill"
                  value={formatTime(time)}
                  error={errors.time}
                  onPress={() => setShowTimePicker(true)}
                />
              </Box>
            </HStack>

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

            <FormField
              label="Available Seats"
              placeholder="Max 4"
              icon="person.fill"
              value={seats}
              error={errors.seats}
              onChangeText={(text) => {
                setSeats(text.replace(/[^0-9]/g, ''));
                setErrors((current) => ({ ...current, seats: undefined }));
              }}
              keyboardType="numeric"
            />

            <VStack space="sm" style={styles.fieldContainer}>
              <HStack className="items-center justify-between">
                <Text className="text-sm font-semibold flex-1" style={{ color: textColor }}>
                  Calculate price on completion
                </Text>
                <Switch
                  value={isPriceCalculated}
                  onValueChange={(value) => {
                    setIsPriceCalculated(value);
                    if (value) {
                      setPrice('');
                      setErrors((current) => ({ ...current, price: undefined }));
                    }
                  }}
                  trackColor={{ false: borderColor, true: primaryColor }}
                />
              </HStack>

              {!isPriceCalculated ? (
                <FormField
                  label="Price per Seat (₹)"
                  placeholder="e.g. 200"
                  icon="indianrupeesign.circle.fill"
                  value={price}
                  error={errors.price}
                  onChangeText={(text) => {
                    setPrice(text.replace(/[^0-9.]/g, ''));
                    setErrors((current) => ({ ...current, price: undefined }));
                  }}
                  keyboardType="numeric"
                />
              ) : null}
            </VStack>

            <FormField
              label="Trip Description & Rules"
              placeholder="E.g. max 1 medium bag per person, etc."
              icon="doc.text.fill"
              value={description}
              error={errors.description}
              onChangeText={(text) => {
                setDescription(text);
                setErrors((current) => ({ ...current, description: undefined }));
              }}
              multiline
              numberOfLines={5}
            />

            <VStack space="sm" style={styles.fieldContainer}>
              <Text className="text-sm font-semibold" style={{ color: textColor }}>
                Gender Preference
              </Text>
              <HStack space="sm">
                {genderOptions.map((option) => {
                  const active = genderPreference === option.key;
                  return (
                    <Pressable
                      key={option.key}
                      className="flex-1 h-11 rounded-xl border items-center justify-center"
                      style={{
                        borderColor: active ? primaryColor : borderColor,
                        backgroundColor: active ? primaryColor : 'transparent',
                      }}
                      onPress={() => setGenderPreference(option.key)}
                    >
                      <Text
                        className="text-sm font-semibold text-center"
                        style={{ color: active ? '#fff' : textColor }}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </HStack>
            </VStack>
          </Box>

          <Text className="text-xs text-center leading-5 px-5" style={{ color: subtextColor }}>
            {isEditing
              ? 'Changes stay editable only until the ride starts and before any passenger is approved.'
              : 'By publishing, you agree to share the ride cost fairly with co-passengers.'}
          </Text>

          <Button
            className="mt-5 rounded-2xl"
            style={[
              styles.publishButtonShadow,
              {
                backgroundColor: primaryColor,
                opacity: publishMutation.isPending ? 0.7 : 1,
              },
            ]}
            onPress={handlePublish}
            disabled={publishMutation.isPending}
          >
            {publishMutation.isPending ? (
              <Spinner color="#fff" />
            ) : (
              <ButtonText>{isEditing ? 'Save Changes' : 'Create Trip'}</ButtonText>
            )}
          </Button>

          <Divider className="mt-6 opacity-0" />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingTop: 20,
  },
  container: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 50,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    paddingTop: 14,
    paddingBottom: 14,
  },
  publishButtonShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
});
