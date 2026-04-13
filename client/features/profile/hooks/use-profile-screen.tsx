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
import { extractAadhaarNumber } from '@/features/profile/utils/profile-screen';

function getAadhaarVerificationErrorMessage(error: unknown) {
  const rawMessage = error instanceof Error ? error.message : String(error ?? '');
  const normalizedMessage = rawMessage.toLowerCase();

  if (
    normalizedMessage.includes('com/google/mlkit') ||
    normalizedMessage.includes('failed resolution') ||
    normalizedMessage.includes('hostfunction')
  ) {
    return 'We could not scan this Aadhaar image right now. Please try again with a clearer photo or update the app and try once more.';
  }

  return 'We could not verify this Aadhaar image right now. Please try again in a moment.';
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
  const [isVerifyingGovernmentId, setIsVerifyingGovernmentId] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [communityConsent, setCommunityConsent] = useState(false);
  const [showConsentAlert, setShowConsentAlert] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [selectedAadhaarImageUri, setSelectedAadhaarImageUri] = useState<string | null>(null);
  const [isEditorSheetOpen, setIsEditorSheetOpen] = useState(false);

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
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to create profile. Please try again.',
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
      aadhaarNumber?: string;
      governmentIdVerified?: boolean;
      isVerified?: boolean;
      communityConsent?: boolean;
    }) =>
      userService.updateProfile(data.documentId, {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        city: data.city,
        avatar: data.avatar,
        governmentIdDocument: data.governmentIdDocument,
        aadhaarNumber: data.aadhaarNumber,
        governmentIdVerified: data.governmentIdVerified,
        isVerified: data.isVerified,
        communityConsent: data.communityConsent,
      }),
    onSuccess: (data) => {
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
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update profile. Please try again.',
      });
    },
  });

  const handlePresentModalPress = useCallback(() => {
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
      const fileId = await userService.uploadFile(uri);
      updateProfileMutation.mutate({
        documentId: profile!.documentId,
        fullName: profile!.fullName,
        phoneNumber: profile!.phoneNumber,
        gender: profile!.gender!,
        city: profile!.city!,
        communityConsent: profile!.communityConsent!,
        avatar: fileId,
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
    if (!fullName.trim() || !phoneNumber.trim() || !city.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Required Fields',
        text2: 'Please enter your name, phone number, and city.',
      });
      return;
    }

    const cleanedPhone = phoneNumber.trim();
    if (cleanedPhone.length !== 10) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Phone Number',
        text2: 'Phone number must be exactly 10 digits.',
      });
      return;
    }

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
    setSelectedAadhaarImageUri(null);
    setShowVerificationAlert(true);
  };

  const handlePickAadhaarImage = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setSelectedAadhaarImageUri(result.assets[0].uri);
    }
  };

  const handleUploadAadhaar = async (imageUri?: string) => {
    const verificationImageUri = imageUri ?? selectedAadhaarImageUri;
    if (!profile || !verificationImageUri) return;

    try {
      setIsVerifyingGovernmentId(true);
      const recognizedText = await TextRecognition.recognize(verificationImageUri);
      const aadhaarNumber = extractAadhaarNumber(recognizedText);

      if (!aadhaarNumber) {
        Toast.show({
          type: 'error',
          text1: 'Aadhaar not detected',
          text2: 'We could not find a valid 12-digit Aadhaar number in that image.',
        });
        setShowVerificationAlert(false);
        setSelectedAadhaarImageUri(null);
        setIsVerifyingGovernmentId(false);
        return;
      }

      const fullText = recognizedText.join(' ').toLowerCase();
      const userNameParts = profile.fullName.toLowerCase().split(' ').filter(p => p.length > 2);
      
      let isNameMatched = false;
      if (userNameParts.length > 0) {
        isNameMatched = userNameParts.some(part => fullText.includes(part));
      } else {
        isNameMatched = profile.fullName.toLowerCase().split(' ').some((part: string) => fullText.includes(part));
      }

      if (!isNameMatched) {
        Toast.show({
          type: 'error',
          text1: 'Name mismatch',
          text2: 'The name on the Aadhaar card does not match your profile name.',
        });
        setShowVerificationAlert(false);
        setSelectedAadhaarImageUri(null);
        setIsVerifyingGovernmentId(false);
        return;
      }

      const governmentIdDocument = await userService.uploadFile(verificationImageUri);
      await updateProfileMutation.mutateAsync({
        documentId: profile.documentId,
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        gender: profile.gender!,
        city: profile.city!,
        governmentIdDocument,
        aadhaarNumber,
        governmentIdVerified: true,
        isVerified: true,
        communityConsent,
      });

      Toast.show({
        type: 'success',
        text1: 'Verification submitted',
        text2: `Aadhaar ending ${aadhaarNumber.slice(-4)} verified successfully.`,
      });
      setShowVerificationAlert(false);
      setSelectedAadhaarImageUri(null);
    } catch (verificationError) {
      console.error('Aadhaar verification error:', verificationError);
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: getAadhaarVerificationErrorMessage(verificationError),
      });
      setShowVerificationAlert(false);
      setSelectedAadhaarImageUri(null);
    } finally {
      setIsVerifyingGovernmentId(false);
    }
  };

  const handleSetPhoneNumber = (value: string) => {
    const digitsOnly = value.replace(/[^\d]/g, '');
    setPhoneNumber(digitsOnly.slice(0, 10));
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
    fullName,
    gender,
    handleEditorSheetChange: (index: number) => setIsEditorSheetOpen(index >= 0),
    handleEditorSheetDismiss: () => setIsEditorSheetOpen(false),
    handlePickImage,
    handlePresentModalPress,
    handleRefresh,
    handleSubmit,
    handleVerifyNowClick,
    handlePickAadhaarImage,
    handleUploadAadhaar,
    isLoading,
    isPending: createProfileMutation.isPending || updateProfileMutation.isPending,
    isRefreshing,
    isUploadingAvatar,
    isVerifyingGovernmentId,
    phoneNumber,
    profile,
    refetch,
    router,
    selectCity,
    setCitySearch,
    setFullName,
    setGender,
    communityConsent,
    setCommunityConsent,
    setPhoneNumber: handleSetPhoneNumber,
    setShowCityPicker,
    setShowConsentAlert,
    showVerificationAlert,
    setShowVerificationAlert,
    selectedAadhaarImageUri,
    setSelectedAadhaarImageUri,
    setShowSignOutModal,
    showCityPicker,
    showConsentAlert,
    handleConsentToggle,
    showSignOutModal,
    signOut,
    snapPoints,
  };
}
