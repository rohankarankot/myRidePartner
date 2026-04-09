import React, { useEffect, useRef, useState } from 'react';
import { Linking, Platform, ScrollView, Share } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useUserStore } from '@/store/user-store';
import { joinRequestService } from '@/services/join-request-service';
import { tripService } from '@/services/trip-service';
import { Trip } from '@/types/api';
import {
  buildTripStartDateTime,
  canCaptainEditTrip,
} from '@/features/trips/utils/trip-editability';
import { buildTripShareMessage } from '@/features/trips/utils/trip-share';
import {
  addDays,
  CreateTripFormErrors,
  formatTripDate,
  formatTripTime,
  getStartOfDay,
} from '@/features/trips/utils/create-trip';

export function useCreateScreen() {
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
  const [errors, setErrors] = useState<CreateTripFormErrors>({});
  const [hasLoadedEditTrip, setHasLoadedEditTrip] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

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

  const validateForm = () => {
    const nextErrors: CreateTripFormErrors = {};
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
    } else if (trimmedFrom.length > 150) {
      nextErrors.from = 'Starting point must be 150 characters or less.';
    }

    if (!trimmedTo) {
      nextErrors.to = 'Destination is required.';
    } else if (trimmedTo.length > 150) {
      nextErrors.to = 'Destination must be 150 characters or less.';
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
      date: formatTripDate(date),
      time: formatTripTime(time),
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

  const handleInputFocus = (offset = 0) => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (offset === -1) {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        } else {
          scrollViewRef.current?.scrollTo({ y: offset, animated: true });
        }
      }, Platform.OS === 'ios' ? 250 : 100);
    });
  };

  const handleDescriptionFocus = () => handleInputFocus(-1);

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

  const setErrorForField = (field: keyof CreateTripFormErrors, value?: string) => {
    setErrors((current) => ({ ...current, [field]: value }));
  };

  return {
    date,
    description,
    editTripId,
    errors,
    formatDate: formatTripDate,
    formatTime: formatTripTime,
    from,
    genderPreference,
    handleDescriptionFocus,
    handleInputFocus,
    handlePublish,
    hasLoadedEditTrip,
    isEditing,
    isEditTripLoading,
    isPriceCalculated,
    isProfileIncomplete,
    maxTripDate,
    navigateToPublishedTrip,
    onDateChange,
    onTimeChange,
    price,
    profile,
    publishedTrip,
    publishMutation,
    resetForm,
    router,
    scrollViewRef,
    seats,
    setDate,
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
    setShowSharePrompt,
    setShowTimePicker,
    setShowToPicker,
    setTime,
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
  };
}
