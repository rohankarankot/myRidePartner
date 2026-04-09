import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
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
    } else {
      setFullName('');
      setPhoneNumber('');
      setGender('men');
      setCity('');
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

  const handleSubmit = () => {
    if (!fullName.trim() || !phoneNumber.trim() || !city.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Required Fields',
        text2: 'Please enter your name, phone number, and city.',
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
      });
    } else if (authUser) {
      createProfileMutation.mutate({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        gender,
        city,
        userId: authUser.id,
      });
    }
  };

  const handleVerifyNow = async () => {
    if (!profile) {
      Toast.show({
        type: 'info',
        text1: 'Complete Profile First',
        text2: 'Please complete your profile before verifying your identity.',
      });
      handlePresentModalPress();
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.9,
    });

    if (result.canceled) return;

    try {
      setIsVerifyingGovernmentId(true);
      const imageUri = result.assets[0].uri;
      const recognizedText = await TextRecognition.recognize(imageUri);
      const aadhaarNumber = extractAadhaarNumber(recognizedText);

      if (!aadhaarNumber) {
        Toast.show({
          type: 'error',
          text1: 'Aadhaar not detected',
          text2: 'We could not find a valid 12-digit Aadhaar number in that image.',
        });
        return;
      }

      const governmentIdDocument = await userService.uploadFile(imageUri);
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
      });

      Toast.show({
        type: 'success',
        text1: 'Verification submitted',
        text2: `Aadhaar ending ${aadhaarNumber.slice(-4)} verified successfully.`,
      });
    } catch (verificationError) {
      console.error('Aadhaar verification error:', verificationError);
      Toast.show({
        type: 'error',
        text1: 'Verification failed',
        text2: 'We could not process that Aadhaar image. Please try again.',
      });
    } finally {
      setIsVerifyingGovernmentId(false);
    }
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
    handleVerifyNow,
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
    setPhoneNumber,
    setShowCityPicker,
    setShowSignOutModal,
    showCityPicker,
    showSignOutModal,
    signOut,
    snapPoints,
  };
}
