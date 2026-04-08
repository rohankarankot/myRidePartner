import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
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
import { Input, InputField } from '@/components/ui/input';
import { useUserProfile } from '@/hooks/use-user-profile';
import { FormField as FormFieldTokens } from '@/constants/ui';


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
  onFocus,
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
  onFocus?: () => void;
}) {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const borderColor = useThemeColor({}, 'border');
  const dangerColor = useThemeColor({}, 'danger');
  const cardColor = useThemeColor({}, 'card');

  return (
    <VStack space="xs" className="mb-6">
      <Text className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: subtextColor }}>
        {label}
      </Text>
      <Input
        variant="underlined"
        size="md"
        isDisabled={!editable || !!onPress}
        isInvalid={!!error}
        className="rounded-[24px] border-2 shadow-sm"
        style={{
          borderColor: error ? dangerColor : borderColor,
          backgroundColor: cardColor,
          minHeight: multiline ? FormFieldTokens.multilineMinHeight : FormFieldTokens.height,
          height: multiline ? 'auto' : FormFieldTokens.height,
          alignItems: multiline ? 'flex-start' : 'center',
        }}
      >
        <Pressable
          onPress={onPress}
          className="flex-1 w-full h-full flex-row items-center px-3"
          disabled={!onPress}
        >
          <IconSymbol
            name={icon}
            size={18}
            color={subtextColor}
            style={{
              marginRight: 10,
              marginTop: multiline ? 16 : 0,
              alignSelf: multiline ? 'flex-start' : 'center'
            }}
          />
          <InputField
            placeholder={placeholder}
            placeholderTextColor={subtextColor}
            className="flex-1 text-[15px] font-medium"
            style={{
              color: textColor,
              textAlignVertical: multiline ? 'top' : 'center',
              paddingTop: multiline ? 14 : 0,
              paddingBottom: 0,
              height: multiline ? undefined : FormFieldTokens.height,
              minHeight: multiline ? 82 : undefined,
            }}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            editable={editable && !onPress}
            multiline={multiline}
            numberOfLines={numberOfLines}
            onFocus={onFocus}
          />
        </Pressable>
      </Input>
      {error ? (
        <Text className="text-[10px] font-bold uppercase tracking-tight ml-1" style={{ color: dangerColor }}>
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
  const scrollViewRef = useRef<ScrollView>(null);

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

  const handleInputFocus = (offset = 0) => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (offset === -1) {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        } else {
          scrollViewRef.current?.scrollTo({ y: offset, animated: true });
        }
      }, Platform.OS === 'ios' ? 250 : 150);
    });
  };

  const handleDescriptionFocus = () => handleInputFocus(-1);

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
    } else if (trimmedFrom.length > 50) {
      nextErrors.from = 'Starting point must be 50 characters or less.';
    }

    if (!trimmedTo) {
      nextErrors.to = 'Destination is required.';
    } else if (trimmedTo.length > 50) {
      nextErrors.to = 'Destination must be 50 characters or less.';
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

  const { isLoading: isProfileLoading } = useUserProfile();

  const isProfileIncomplete =
    !profile || !profile.fullName || !profile.phoneNumber || !profile.gender || !profile.city;

  useFocusEffect(
    React.useCallback(() => {
      if (!isProfileLoading && isProfileIncomplete) {
        setShowProfileAlert(true);
      }
    }, [isProfileIncomplete, isProfileLoading])
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
      router.push({ pathname: '/(tabs)/profile', params: { openEditor: 'true' } });
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
      <Box className="flex-1 items-center justify-center px-10" style={{ backgroundColor }}>
        <Spinner size="large" color={primaryColor} />
        <Text className="mt-4 text-sm font-extrabold uppercase tracking-widest text-center" style={{ color: subtextColor }}>
          Synchronizing ride data…
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
        title="Pickup Point"
      />

      <LocationSearchModal
        visible={showToPicker}
        onClose={() => setShowToPicker(false)}
        onSelectLocation={(address: string) => {
          setTo(address);
          setErrors((current) => ({ ...current, to: undefined }));
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

      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ paddingHorizontal: 0, paddingTop: 20, paddingBottom: 10 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        >
          <VStack space="xs" className="mb-6 px-6">
            <Text className="text-3xl font-extrabold" style={{ color: textColor }}>
              {isEditing ? 'Edit Trip' : 'New Trip'}
            </Text>
            <Text className="text-sm font-medium leading-6" style={{ color: subtextColor }}>
              {isEditing
                ? 'Update your trip details. Approved passengers will be notified of changes.'
                : 'Enter your route and timing details to start sharing your ride.'}
            </Text>
          </VStack>

          <Box
            className="mx-6 mb-8 rounded-[32px] border p-5 shadow-sm"
            style={{ backgroundColor: cardColor, borderColor }}
          >
            <Box className="px-6">
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

              <VStack space="md">
                <FormField
                  label="Date"
                  placeholder="Ride Date"
                  icon="calendar"
                  value={formatDate(date)}
                  error={errors.date}
                  onPress={() => setShowDatePicker(true)}
                />
                <FormField
                  label="Time"
                  placeholder="Ride Time"
                  icon="clock.fill"
                  value={formatTime(time)}
                  error={errors.time}
                  onPress={() => setShowTimePicker(true)}
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

              <FormField
                label="Available Seats"
                placeholder="Min 1, Max 4"
                icon="person.fill"
                value={seats}
                error={errors.seats}
                onChangeText={(text) => {
                  setSeats(text.replace(/[^0-9]/g, ''));
                  setErrors((current) => ({ ...current, seats: undefined }));
                }}
                onFocus={() => handleInputFocus(400)}
                keyboardType="numeric"
              />

              <VStack space="md" className="mb-10">
                <HStack className="items-center justify-between px-1">
                  <VStack className="flex-1">
                    <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>Fare Logic</Text>
                    <Text className="text-sm font-bold" style={{ color: textColor }}>
                      Auto-calculate expenses
                    </Text>
                  </VStack>
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

                {!isPriceCalculated && (
                  <Box className="mt-4">
                    <FormField
                      label="Fixed Price per Seat (₹)"
                      placeholder="e.g. 200"
                      icon="indianrupeesign.circle.fill"
                      value={price}
                      error={errors.price}
                      onChangeText={(text) => {
                        setPrice(text.replace(/[^0-9.]/g, ''));
                        setErrors((current) => ({ ...current, price: undefined }));
                      }}
                      onFocus={() => handleInputFocus(600)}
                      keyboardType="numeric"
                    />
                  </Box>
                )}
              </VStack>

              <FormField
                label="Trip Bio & Ground Rules"
                placeholder="Tell riders about luggage, music, or stopovers..."
                icon="doc.text.fill"
                value={description}
                error={errors.description}
                onChangeText={(text) => {
                  setDescription(text);
                  setErrors((current) => ({ ...current, description: undefined }));
                }}
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
                  {genderOptions.map((option) => {
                    const active = genderPreference === option.key;
                    return (
                      <Pressable
                        key={option.key}
                        className="flex-1 h-12 rounded-2xl border-2 items-center justify-center shadow-sm"
                        style={{
                          borderColor: active ? primaryColor : borderColor,
                          backgroundColor: active ? primaryColor : 'transparent',
                        }}
                        onPress={() => setGenderPreference(option.key)}
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
            </Box>
          </Box>

          <VStack className="items-center px-6 mb-6" space="xs">
            <IconSymbol name="shield.lefthalf.filled" size={24} color={primaryColor} />
            <Text className="text-[10px] font-extrabold uppercase tracking-widest text-center leading-4" style={{ color: subtextColor }}>
              By publishing, you commit to split costs fairly and adhering to the community guidelines.
            </Text>
          </VStack>

          <Box className="px-6 mb-10">
            <Button
              className="h-14 rounded-2xl shadow-md"
              style={{
                backgroundColor: primaryColor,
                opacity: publishMutation.isPending ? 0.8 : 1,
              }}
              onPress={handlePublish}
              disabled={publishMutation.isPending}
            >
              {publishMutation.isPending ? (
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
          </Box>

          <Box className="h-20" />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
