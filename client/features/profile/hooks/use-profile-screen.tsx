import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import TextRecognition from 'react-native-text-recognition';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { useBottomSheetBackHandler } from '@/hooks/use-bottom-sheet-back-handler';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useAuth } from '@/context/auth-context';
import { useUserStore } from '@/store/user-store';
import { userService } from '@/services/user-service';

type ProfileFieldName = 'fullName' | 'phoneNumber' | 'city';

type ProfileFieldErrors = Partial<Record<ProfileFieldName, string>>;



function getErrorMessages(error: any): string[] {
  const message = error?.response?.data?.message;

  if (Array.isArray(message)) {
    return message.map((entry) => String(entry));
  }

  if (typeof message === 'string') {
    return [message];
  }

  const nestedMessage = error?.response?.data?.error?.message;
  if (typeof nestedMessage === 'string') {
    return [nestedMessage];
  }

  return [];
}

function getProfileMutationErrors(error: unknown): {
  fieldErrors: ProfileFieldErrors;
  genericMessage: string | null;
} {
  const messages = getErrorMessages(error);
  const fieldErrors: ProfileFieldErrors = {};

  for (const message of messages) {
    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.includes('name')) {
      fieldErrors.fullName ??= message;
      continue;
    }

    if (normalizedMessage.includes('phone')) {
      fieldErrors.phoneNumber ??= message;
      continue;
    }

    if (normalizedMessage.includes('city')) {
      fieldErrors.city ??= message;
    }
  }

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  if (hasFieldErrors) {
    return { fieldErrors, genericMessage: null };
  }

  return {
    fieldErrors,
    genericMessage: messages[0] ?? 'Failed to save profile. Please try again.',
  };
}

export function useProfileScreen() {
  const { openEditor } = useLocalSearchParams<{ openEditor?: string }>();
  const { user: authUser, signOut } = useAuth();
  const {
    profile: storedProfile,
    isLoading: isStoreLoading,
    setProfile,
  } = useUserStore();
  const {
    data: profileData,
    isLoading: isQueryLoading,
    error,
    refetch,
  } = useUserProfile();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState<'men' | 'women'>('men');
  const [city, setCity] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [orgEmailInput, setOrgEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [verificationStep, setVerificationStep] = useState<'email' | 'otp'>('email');
  const [isVerifyingOrg, setIsVerifyingOrg] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [communityConsent, setCommunityConsent] = useState(false);
  const [showConsentAlert, setShowConsentAlert] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [isEditorSheetOpen, setIsEditorSheetOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const hasOpenedFromRouteRef = useRef(false);
  const snapPoints = ['90%'];

  useBottomSheetBackHandler([{ isOpen: isEditorSheetOpen, ref: bottomSheetModalRef }]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const profile = storedProfile || profileData;
  const isOrganizationVerificationPending =
    Boolean(profile?.organizationEmail) && !profile?.isOrganizationVerified;
  const isLoading = isStoreLoading || (isQueryLoading && !storedProfile && !error);

  const createProfileMutation = useMutation({
    mutationFn: (data: {
      fullName: string;
      phoneNumber: string;
      gender: 'men' | 'women';
      city: string;
      communityConsent: boolean;
      userId: number;
    }) => userService.createProfile(data),
    onSuccess: (data) => {
      setFieldErrors({});
      setProfile(data);
      queryClient.invalidateQueries({ queryKey: ['user-profile', authUser?.id] });
      refetch();
      bottomSheetModalRef.current?.dismiss();
      Toast.show({
        type: 'success',
        text1: 'Profile Created',
        text2: 'Your profile has been successfully set up!',
      });
    },
    onError: (mutationError) => {
      console.error('Create profile error:', mutationError);

      const { fieldErrors: nextFieldErrors, genericMessage } = getProfileMutationErrors(mutationError);
      if (Object.keys(nextFieldErrors).length > 0) {
        setFieldErrors(nextFieldErrors);
        return;
      }

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: genericMessage ?? 'Failed to create profile. Please try again.',
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: {
      documentId: string;
      fullName: string;
      phoneNumber: string;
      gender: 'men' | 'women';
      city: string;
      avatar?: string;
      governmentIdDocument?: string;
      isVerified?: boolean;
      isOrganizationVerified?: boolean;
      communityConsent?: boolean;
    }) =>
      userService.updateProfile(data.documentId, {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        city: data.city,
        avatar: data.avatar,
        isVerified: data.isVerified,
        isOrganizationVerified: data.isOrganizationVerified,
        communityConsent: data.communityConsent,
      }),
    onSuccess: (data) => {
      setFieldErrors({});
      setProfile(data);
      queryClient.invalidateQueries({ queryKey: ['user-profile', authUser?.id] });
      refetch();
      bottomSheetModalRef.current?.dismiss();
      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile has been successfully updated!',
      });
    },
    onError: (mutationError) => {
      console.error('Update profile error:', mutationError);

      const { fieldErrors: nextFieldErrors, genericMessage } = getProfileMutationErrors(mutationError);
      if (Object.keys(nextFieldErrors).length > 0) {
        setFieldErrors(nextFieldErrors);
        return;
      }

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: genericMessage ?? 'Failed to update profile. Please try again.',
      });
    },
  });

  const clearFieldError = useCallback((field: ProfileFieldName) => {
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      return {
        ...current,
        [field]: undefined,
      };
    });
  }, []);

  const handlePresentModalPress = useCallback(() => {
    setFieldErrors({});
    if (profile) {
      setFullName(profile.fullName || '');
      setPhoneNumber(profile.phoneNumber || '');
      setGender(profile.gender || 'men');
      setCity(profile.city || '');
      setCommunityConsent(profile.communityConsent ?? false);
    } else {
      setFullName('');
      setPhoneNumber('');
      setGender('men');
      setCity('');
      setCommunityConsent(false);
    }
    setIsEditorSheetOpen(true);
    bottomSheetModalRef.current?.present();
  }, [profile]);

  useEffect(() => {
    if (openEditor === 'true' && !hasOpenedFromRouteRef.current) {
      hasOpenedFromRouteRef.current = true;
      requestAnimationFrame(() => {
        handlePresentModalPress();
        router.setParams({ openEditor: undefined });
      });
      return;
    }

    if (openEditor !== 'true') {
      hasOpenedFromRouteRef.current = false;
    }
  }, [handlePresentModalPress, openEditor, router]);

  const uploadAvatar = async (uri: string) => {
    setIsUploadingAvatar(true);
    try {
      const uploaded = await userService.uploadFile(uri);
      updateProfileMutation.mutate({
        documentId: profile!.documentId,
        fullName: profile!.fullName,
        phoneNumber: profile!.phoneNumber,
        gender: profile!.gender!,
        city: profile!.city!,
        communityConsent: profile!.communityConsent!,
        avatar: uploaded.url,
      });
    } catch (uploadError) {
      console.error('Upload avatar error:', uploadError);
      Toast.show({
        type: 'error',
        text1: 'Upload Error',
        text2: 'Failed to upload image. Please try again.',
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handlePickImage = async () => {
    if (!profile) {
      Toast.show({
        type: 'info',
        text1: 'Complete Profile First',
        text2: 'Please complete your profile before adding an avatar.',
      });
      handlePresentModalPress();
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const selectCity = (selected: string) => {
    setCity(selected);
    clearFieldError('city');
    setShowCityPicker(false);
    setCitySearch('');
  };

  const handleConsentToggle = () => {
    if (communityConsent) {
      // User is trying to opt out: show alert
      setShowConsentAlert(true);
    } else {
      // User is opting in: just do it
      setCommunityConsent(true);
    }
  };

  const handleSubmit = () => {
    const nextFieldErrors: ProfileFieldErrors = {};

    if (!fullName.trim()) {
      nextFieldErrors.fullName = 'Please enter your full name.';
    }

    if (!phoneNumber.trim()) {
      nextFieldErrors.phoneNumber = 'Please enter your phone number.';
    } else if (phoneNumber.trim().length !== 10) {
      nextFieldErrors.phoneNumber = 'Phone number must be exactly 10 digits.';
    }

    if (!city.trim()) {
      nextFieldErrors.city = 'Please select your preferred city.';
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setFieldErrors({});

    if (profile) {
      updateProfileMutation.mutate({
        documentId: profile.documentId,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        gender,
        city,
        communityConsent,
      });
    } else if (authUser) {
      createProfileMutation.mutate({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        gender,
        city,
        communityConsent,
        userId: authUser.id,
      });
    }
  };

  const handleVerifyNowClick = () => {
    if (!profile) {
      Toast.show({
        type: 'info',
        text1: 'Complete Profile First',
        text2: 'Please complete your profile before verifying your identity.',
      });
      handlePresentModalPress();
      return;
    }
    setOrgEmailInput(profile.organizationEmail || '');
    setOtpInput('');
    setVerificationStep(profile.organizationEmail && !profile.isOrganizationVerified ? 'otp' : 'email');
    setShowVerificationAlert(true);
  };

  const resetVerificationFlow = useCallback(() => {
    setShowVerificationAlert(false);
    setOrgEmailInput('');
    setOtpInput('');
    setVerificationStep('email');
  }, []);

  const handleChangeVerificationEmail = useCallback(() => {
    setVerificationStep('email');
    setOtpInput('');
  }, []);

  const handleRequestOrgVerification = async () => {
    if (!orgEmailInput.trim()) {
      Toast.show({ type: 'error', text1: 'Email required', text2: 'Please enter your work or college email.' });
      return;
    }

    setIsVerifyingOrg(true);
    try {
      await userService.requestOrgVerification(orgEmailInput.trim());
      setVerificationStep('otp');
      Toast.show({ type: 'success', text1: 'OTP Sent', text2: 'Check your email for the verification code.' });
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Failed', text2: getErrorMessages(error)[0] ?? 'Could not send OTP.' });
    } finally {
      setIsVerifyingOrg(false);
    }
  };

  const handleConfirmOrgVerification = async () => {
    if (!otpInput.trim() || otpInput.trim().length !== 6) {
      Toast.show({ type: 'error', text1: 'Invalid OTP', text2: 'Please enter the 6-digit code.' });
      return;
    }

    setIsVerifyingOrg(true);
    try {
      await userService.confirmOrgVerification(orgEmailInput.trim(), otpInput.trim());

      Toast.show({ type: 'success', text1: 'Verified!', text2: 'Your organization has been verified successfully.' });
      resetVerificationFlow();

      // Refresh profile to pull the new badge details
      queryClient.invalidateQueries({ queryKey: ['user-profile', authUser?.id] });
      refetch();
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Failed', text2: getErrorMessages(error)[0] ?? 'Verification failed.' });
    } finally {
      setIsVerifyingOrg(false);
    }
  };

  const handleSetPhoneNumber = (value: string) => {
    const digitsOnly = value.replace(/[^\d]/g, '');
    clearFieldError('phoneNumber');
    setPhoneNumber(digitsOnly.slice(0, 10));
  };

  const handleSetFullName = (value: string) => {
    clearFieldError('fullName');
    setFullName(value);
  };

  return {
    authUser,
    bottomSheetModalRef,
    borderBackdrop: (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    city,
    citySearch,
    error,
    fieldErrors,
    fullName,
    gender,
    handleEditorSheetChange: (index: number) => setIsEditorSheetOpen(index >= 0),
    handleEditorSheetDismiss: () => setIsEditorSheetOpen(false),
    handlePickImage,
    handlePresentModalPress,
    handleRefresh,
    handleSubmit,
    handleVerifyNowClick,
    handleRequestOrgVerification,
    handleConfirmOrgVerification,
    handleChangeVerificationEmail,
    resetVerificationFlow,
    isLoading,
    isPending: createProfileMutation.isPending || updateProfileMutation.isPending,
    isRefreshing,
    isUploadingAvatar,
    isVerifyingOrg,
    phoneNumber,
    profile,
    refetch,
    router,
    selectCity,
    setCitySearch,
    setFullName: handleSetFullName,
    setGender,
    communityConsent,
    setCommunityConsent,
    setPhoneNumber: handleSetPhoneNumber,
    setShowCityPicker,
    setShowConsentAlert,
    showVerificationAlert,
    setShowVerificationAlert,
    orgEmailInput,
    setOrgEmailInput,
    otpInput,
    setOtpInput,
    verificationStep,
    setVerificationStep,
    setShowSignOutModal,
    showCityPicker,
    showConsentAlert,
    handleConsentToggle,
    showSignOutModal,
    signOut,
    snapPoints,
    isOrganizationVerificationPending,
  };
}
