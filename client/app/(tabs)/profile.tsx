import React, { useState, useCallback, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import TextRecognition from 'react-native-text-recognition';
import {
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import { useUserProfile } from '@/hooks/use-user-profile';
import { useAuth } from '@/context/auth-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useUserStore } from '@/store/user-store';
import { userService } from '@/services/user-service';
import { CITIES } from '@/constants/cities';
import { ProfileSkeleton } from '@/features/profile/components/ProfileSkeleton';
import { CustomAlert } from '@/components/CustomAlert';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Divider } from '@/components/ui/divider';
import { Button, ButtonText } from '@/components/ui/button';

const DUMMY_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';

type ActionRowProps = {
  icon: string;
  label: string;
  iconColor: string;
  iconBackground: string;
  textColor: string;
  chevronColor: string;
  onPress: () => void;
  showDivider?: boolean;
};

function ActionRow({
  icon,
  label,
  iconColor,
  iconBackground,
  textColor,
  chevronColor,
  onPress,
  showDivider = true,
}: ActionRowProps) {
    const borderColor = useThemeColor({}, 'border');

  return (
    <VStack >
        <Pressable className="py-4 px-2" onPress={onPress}>
        <HStack className="items-center justify-between">
            <HStack space="md" className="items-center">
            <Box
                className="h-10 w-10 rounded-2xl items-center justify-center shadow-sm"
                style={{ backgroundColor: iconBackground }}
            >
                <IconSymbol name={icon as any} size={18} color={iconColor} />
            </Box>
            <Text className="text-base font-bold" style={{ color: textColor }}>
                {label}
            </Text>
            </HStack>
            <IconSymbol name="chevron.right" size={16} color={chevronColor} />
        </HStack>
        </Pressable>
        {showDivider && <Divider className="mx-2" style={{ backgroundColor: borderColor }} />}
    </VStack>
  );
}

export default function ProfileScreen() {
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

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = ['90%'];

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const profile = storedProfile || profileData;
  const isLoading = isStoreLoading || (isQueryLoading && !storedProfile && !error);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
  const successBgColor = useThemeColor({}, 'successBg');
  const dangerColor = useThemeColor({}, 'danger');
  const dangerBgColor = useThemeColor({}, 'dangerBg');
  const borderColor = useThemeColor({}, 'border');

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
    bottomSheetModalRef.current?.present();
  }, [profile]);

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

  const maskAadhaarNumber = (value?: string | null) => {
    if (!value || value.length < 4) return 'Not available';
    return `XXXX XXXX ${value.slice(-4)}`;
  };

  const extractAadhaarNumber = (recognizedText: string[]) => {
    const normalizedText = recognizedText.join(' ').replace(/[^\d]/g, '');
    const match = normalizedText.match(/[2-9]\d{11}/);
    return match ? match[0] : null;
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

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error && !profile) {
    return (
      <Box className="flex-1 items-center justify-center px-10" style={{ backgroundColor }}>
        <Stack.Screen options={{ title: 'Profile', headerTitleStyle: { fontWeight: '800' } }} />
        <VStack className="items-center" space="md">
            <Box className="w-20 h-20 rounded-full bg-gray-50 items-center justify-center mb-2">
                <IconSymbol name="person.crop.circle.badge.exclamationmark" size={40} color={subtextColor} />
            </Box>
            <Text className="text-xl font-extrabold text-center" style={{ color: textColor }}>
                Failed to load profile
            </Text>
            <Button className="rounded-full shadow-sm" onPress={() => refetch()}>
                <ButtonText className="font-extrabold uppercase tracking-widest px-4">Retry</ButtonText>
            </Button>
        </VStack>
      </Box>
    );
  }

  const user = profile?.user || authUser;
  const avatarUrl =
    typeof profile?.avatar === 'string'
      ? profile.avatar
      : profile?.avatar?.url || profile?.avatar?.formats?.small?.url;
  const name = profile?.fullName || 'No Name Set';
  const phone = profile?.phoneNumber || 'N/A';
  const profileGender = profile?.gender;
  const aadhaarNumber = profile?.aadhaarNumber;
  const rating = profile?.rating || 0;
  const completedTripsCount = profile?.completedTripsCount || 0;
  const isVerified = profile?.isVerified || false;
  const isGovernmentIdVerified = profile?.governmentIdVerified || false;
  const isPending = createProfileMutation.isPending || updateProfileMutation.isPending;
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Profile',
          headerTitleStyle: { fontWeight: '800' },
          headerShown: true,
          headerTransparent: false,
          headerStyle: { backgroundColor: cardColor },
          headerTintColor: textColor,
          headerShadowVisible: false,
          headerRight: () =>
            profile ? (
              <Pressable className="mr-4" onPress={() => router.push('/settings')}>
                <IconSymbol name="gearshape.fill" size={24} color={primaryColor} />
              </Pressable>
            ) : null,
        }}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={primaryColor}
            colors={[primaryColor]}
          />
        }
      >
        <VStack className="items-center py-10" space="lg">
          <Pressable onPress={handlePickImage} disabled={isUploadingAvatar} className="relative">
            <Avatar size="2xl" className="border-4 shadow-xl" style={{ borderColor: cardColor }}>
              <AvatarFallbackText>{initials || 'MR'}</AvatarFallbackText>
              <AvatarImage
                source={avatarUrl ? { uri: avatarUrl } : { uri: DUMMY_AVATAR }}
                alt={name}
              />
            </Avatar>
            {isUploadingAvatar ? (
              <Box className="absolute inset-0 bg-black/40 rounded-full items-center justify-center">
                <Spinner color="#fff" size="small" />
              </Box>
            ) : (
              <Box
                className="absolute bottom-1 right-1 w-10 h-10 rounded-full border-4 items-center justify-center shadow-lg"
                style={{ backgroundColor: primaryColor, borderColor: cardColor }}
              >
                <IconSymbol name="camera.fill" size={16} color="#fff" />
              </Box>
            )}
          </Pressable>

          <VStack className="items-center" space="xs">
            <Text className="text-3xl font-extrabold text-center" style={{ color: textColor }}>
                {name}
            </Text>
            {profile?.city ? (
                <HStack space="xs" className="items-center px-3 py-1 rounded-full border border-dashed" style={{ borderColor: primaryColor }}>
                    <IconSymbol name="mappin.circle.fill" size={12} color={primaryColor} />
                    <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
                        {profile.city}
                    </Text>
                </HStack>
            ) : (
                <Text className="text-sm font-medium" style={{ color: subtextColor }}>
                    {user?.email}
                </Text>
            )}
          </VStack>

          {!profile ? (
            <Pressable
              className="mt-2 rounded-2xl px-8 py-3 border shadow-sm"
              style={{ backgroundColor: `${primaryColor}10`, borderColor: primaryColor }}
              onPress={handlePresentModalPress}
            >
              <Text className="text-sm font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
                Complete profile →
              </Text>
            </Pressable>
          ) : isVerified ? (
            <VStack className="items-center" space="sm">
              <Box className="rounded-full px-5 py-1.5 border shadow-sm" style={{ backgroundColor: successBgColor, borderColor: successColor + '20' }}>
                <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: successColor }}>
                  Verified Account
                </Text>
              </Box>
              {isGovernmentIdVerified && (
                <HStack
                  space="xs"
                  className="items-center rounded-full px-4 py-1.5 border shadow-sm"
                  style={{ backgroundColor: `${primaryColor}10`, borderColor: primaryColor + '20' }}
                >
                  <IconSymbol name="checkmark.shield.fill" size={12} color={primaryColor} />
                  <Text className="text-[9px] font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
                    Government ID confirmed
                  </Text>
                </HStack>
              )}
            </VStack>
          ) : (
            <VStack className="items-center" space="md">
              <Box className="rounded-full px-5 py-1.5 border shadow-sm" style={{ backgroundColor: dangerBgColor, borderColor: dangerColor + '20' }}>
                <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: dangerColor }}>
                  Unverified Status
                </Text>
              </Box>
              <Pressable 
                className="px-6 py-2.5 rounded-2xl border-2 border-dashed" 
                style={{ borderColor: primaryColor }}
                onPress={handleVerifyNow} 
                disabled={isVerifyingGovernmentId}
              >
                  {isVerifyingGovernmentId ? (
                    <HStack space="sm" className="items-center px-2">
                        <Spinner size="small" color={primaryColor} />
                        <Text className="text-xs font-bold uppercase tracking-tight" style={{ color: primaryColor }}>Processing ID...</Text>
                    </HStack>
                  ) : (
                    <Text className="text-xs font-bold uppercase tracking-tight" style={{ color: primaryColor }}>Verify Identity now?</Text>
                  )}
              </Pressable>
            </VStack>
          )}
        </VStack>

        <Box className="mx-6 rounded-[32px] p-6 mb-6 shadow-sm border" style={{ backgroundColor: cardColor, borderColor }}>
          <Text className="text-[10px] font-extrabold uppercase tracking-widest mb-6" style={{ color: subtextColor }}>
            Performance
          </Text>

          <HStack className="justify-between items-center">
            <Pressable className="flex-1 items-center" onPress={() => router.push('/ratings')}>
                <VStack className="items-center" space="xs">
                    <Box className="w-12 h-12 rounded-2xl items-center justify-center shadow-sm" style={{ backgroundColor: `${primaryColor}10` }}>
                        <IconSymbol name="star.fill" size={20} color="#F59E0B" />
                    </Box>
                    <Text className="text-xl font-extrabold" style={{ color: textColor }}>{Number(rating).toFixed(1)}</Text>
                    <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: subtextColor }}>Rating</Text>
                </VStack>
            </Pressable>

            <Divider className="h-10 w-px" style={{ backgroundColor: borderColor }} />

            <Pressable className="flex-1 items-center" onPress={() => router.push({ pathname: '/my-activity', params: { tab: 'completed' } })}>
                <VStack className="items-center" space="xs">
                    <Box className="w-12 h-12 rounded-2xl items-center justify-center shadow-sm" style={{ backgroundColor: `${primaryColor}10` }}>
                        <IconSymbol name="flag.checkered" size={18} color={primaryColor} />
                    </Box>
                    <Text className="text-xl font-extrabold" style={{ color: textColor }}>{completedTripsCount}</Text>
                    <Text className="text-[10px] font-bold uppercase tracking-widest text-center" style={{ color: subtextColor }}>Trip Count</Text>
                </VStack>
            </Pressable>

            <Divider className="h-10 w-px" style={{ backgroundColor: borderColor }} />

            <Pressable className="flex-1 items-center" onPress={() => router.push('/profile-analytics')}>
                <VStack className="items-center" space="xs">
                    <Box className="w-12 h-12 rounded-2xl items-center justify-center shadow-sm" style={{ backgroundColor: `${primaryColor}10` }}>
                        <IconSymbol name="chart.bar.fill" size={18} color="#8B5CF6" />
                    </Box>
                    <Text className="text-xl font-extrabold" style={{ color: textColor }}>View</Text>
                    <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: subtextColor }}>Insights</Text>
                </VStack>
            </Pressable>
          </HStack>
        </Box>

        <Box className="mx-6 rounded-[32px] p-6 mb-6 shadow-sm border" style={{ backgroundColor: cardColor, borderColor }}>
          <Text className="text-[10px] font-extrabold uppercase tracking-widest mb-6" style={{ color: subtextColor }}>
            Account Details
          </Text>

          <VStack space="xl">
            <HStack className="justify-between items-center">
                <HStack space="md" className="items-center">
                    <Box className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center shadow-sm">
                        <IconSymbol name="at" size={16} color={subtextColor} />
                    </Box>
                    <VStack >
                        <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>Username</Text>
                        <Text className="text-base font-bold" style={{ color: textColor }}>{user?.username}</Text>
                    </VStack>
                </HStack>
            </HStack>

            <HStack className="justify-between items-center">
                <HStack space="md" className="items-center">
                    <Box className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center shadow-sm">
                        <IconSymbol name="phone.fill" size={16} color="#10B981" />
                    </Box>
                    <VStack >
                        <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>Phone</Text>
                        <Text className="text-base font-bold" style={{ color: textColor }}>{phone}</Text>
                    </VStack>
                </HStack>
            </HStack>

            <HStack className="justify-between items-center">
                <HStack space="md" className="items-center">
                    <Box className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center shadow-sm">
                        <IconSymbol
                            name="person.fill"
                            size={16}
                            color={profileGender === 'men' ? '#3B82F6' : profileGender === 'women' ? '#EC4899' :  subtextColor }
                        />
                    </Box>
                    <VStack >
                        <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>Gender</Text>
                        <Text className="text-base font-bold capitalize" style={{ color: textColor }}>{profileGender || 'Not set'}</Text>
                    </VStack>
                </HStack>
            </HStack>

            {aadhaarNumber && (
                <HStack className="justify-between items-center">
                    <HStack space="md" className="items-center">
                        <Box className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center shadow-sm">
                            <IconSymbol name="checkmark.shield.fill" size={16} color={successColor} />
                        </Box>
                        <VStack >
                            <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>Government ID</Text>
                            <Text className="text-base font-bold" style={{ color: textColor }}>{maskAadhaarNumber(aadhaarNumber)}</Text>
                        </VStack>
                    </HStack>
                </HStack>
            )}
          </VStack>
        </Box>

        <Box className="mx-6 rounded-[32px] p-4 shadow-sm border" style={{ backgroundColor: cardColor, borderColor }}>
          <Text className="text-[10px] font-extrabold uppercase tracking-widest mt-2 ml-4 mb-2" style={{ color: subtextColor }}>
            Actions
          </Text>
          <ActionRow
            icon="pencil"
            label={!profile ? 'Complete Profile' : 'Edit Profile Information'}
            iconColor={primaryColor}
            iconBackground={`${primaryColor}10`}
            textColor={textColor}
            chevronColor={subtextColor}
            onPress={handlePresentModalPress}
          />
          <ActionRow
            icon="bell.fill"
            label="Notification Preferences"
            iconColor="#F87171"
            iconBackground="#F8717110"
            textColor={textColor}
            chevronColor={subtextColor}
            onPress={() => router.push('/notifications')}
          />
          <ActionRow
            icon="rectangle.portrait.and.arrow.right"
            label="Sign Out"
            iconColor={dangerColor}
            iconBackground={`${dangerColor}10`}
            textColor={dangerColor}
            chevronColor={subtextColor}
            onPress={() => setShowSignOutModal(true)}
            showDivider={false}
          />
        </Box>

        <VStack className="items-center py-12" space="xs">
            <Divider className="w-12 mb-4" style={{ backgroundColor: borderColor }} />
            <Text className="text-[8px] font-extrabold uppercase tracking-widest text-center" style={{ color: subtextColor }}>
                Joining since 2026 • My Ride Partner Community
            </Text>
        </VStack>
      </ScrollView>

      <CustomAlert
        visible={showSignOutModal}
        title="Sign Out?"
        message="You'll need to log back in to access your account."
        icon="rectangle.portrait.and.arrow.right"
        onClose={() => setShowSignOutModal(false)}
        primaryButton={{
          text: 'Sign Out',
          onPress: () => {
            setShowSignOutModal(false);
            signOut();
          },
        }}
        secondaryButton={{
          text: 'Cancel',
          onPress: () => setShowSignOutModal(false),
        }}
      />

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
        )}
        backgroundStyle={{ backgroundColor: cardColor }}
        handleIndicatorStyle={{ backgroundColor: borderColor }}
        keyboardBehavior="fillParent"
        keyboardBlurBehavior="restore"
      >
        <BottomSheetScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
          <HStack className="justify-between items-center mb-10">
            <Text className="text-2xl font-extrabold" style={{ color: textColor }}>
              {profile ? 'Edit Profile' : 'Complete Profile'}
            </Text>
            <Pressable className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center shadow-sm" onPress={() => bottomSheetModalRef.current?.dismiss()}>
              <IconSymbol name="xmark" size={16} color={subtextColor} />
            </Pressable>
          </HStack>

          <VStack space="xl">
            <VStack space="xs">
                <Text className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: subtextColor }}>Full Name</Text>
                <BottomSheetTextInput
                    style={{ height: 60, borderWidth: 2, borderRadius: 20, paddingHorizontal: 20, fontSize: 16, color: textColor, borderColor }}
                    placeholder="Enter your legal name"
                    placeholderTextColor={subtextColor}
                    value={fullName}
                    onChangeText={setFullName}
                />
            </VStack>

            <VStack space="xs">
                <Text className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: subtextColor }}>Phone Number</Text>
                <BottomSheetTextInput
                    style={{ height: 60, borderWidth: 2, borderRadius: 20, paddingHorizontal: 20, fontSize: 16, color: textColor, borderColor }}
                    placeholder="+91 XXXXX XXXXX"
                    placeholderTextColor={subtextColor}
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                />
            </VStack>

            <VStack space="xs">
                <Text className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: subtextColor }}>Gender</Text>
                <HStack space="md">
                    <Pressable
                        className="flex-1 h-14 rounded-2xl items-center justify-center border-2 shadow-sm"
                        style={{ 
                            borderColor: gender === 'men' ? primaryColor : borderColor, 
                            backgroundColor: gender === 'men' ? primaryColor : `${subtextColor}05` 
                        }}
                        onPress={() => setGender('men')}
                    >
                        <Text className="text-xs font-extrabold uppercase tracking-widest" style={{ color: gender === 'men' ? '#fff' : textColor }}>Male</Text>
                    </Pressable>
                    <Pressable
                        className="flex-1 h-14 rounded-2xl items-center justify-center border-2 shadow-sm"
                        style={{ 
                            borderColor: gender === 'women' ? primaryColor : borderColor, 
                            backgroundColor: gender === 'women' ? primaryColor : `${subtextColor}05` 
                        }}
                        onPress={() => setGender('women')}
                    >
                        <Text className="text-xs font-extrabold uppercase tracking-widest" style={{ color: gender === 'women' ? '#fff' : textColor }}>Female</Text>
                    </Pressable>
                </HStack>
            </VStack>

            <VStack space="xs">
                <Text className="text-[10px] font-extrabold uppercase tracking-widest ml-1" style={{ color: subtextColor }}>Preferred City</Text>
                <Pressable
                    className="h-[60px] border-2 rounded-[20px] px-5 flex-row items-center justify-between"
                    style={{ borderColor }}
                    onPress={() => setShowCityPicker(!showCityPicker)}
                >
                    <Text style={{ color: city ? textColor : subtextColor }} className="text-base font-medium">
                        {city || 'Select your community city'}
                    </Text>
                    <IconSymbol name="chevron.down" size={16} color={subtextColor} />
                </Pressable>

                {showCityPicker && (
                    <Box className="mt-2 rounded-[24px] border-2 p-3 shadow-sm" style={{ backgroundColor: `${subtextColor}05`, borderColor: `${borderColor}50` }}>
                        <BottomSheetTextInput
                            style={{ height: 48, borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 16, fontSize: 14, color: textColor, borderColor: `${borderColor}30`, backgroundColor: cardColor, marginBottom: 12 }}
                            placeholder="Type city name..."
                            placeholderTextColor={subtextColor}
                            value={citySearch}
                            onChangeText={setCitySearch}
                        />
                        <ScrollView nestedScrollEnabled className="max-h-[200px]">
                            {CITIES.filter((entry) =>
                                entry.toLowerCase().includes(citySearch.toLowerCase())
                            ).map((entry) => (
                                <Pressable
                                    key={entry}
                                    className="py-3 px-4 rounded-xl flex-row justify-between items-center mb-1"
                                    style={{ backgroundColor: city === entry ? `${primaryColor}15` : 'transparent' }}
                                    onPress={() => selectCity(entry)}
                                >
                                    <Text className="text-sm font-bold" style={{ color: city === entry ? primaryColor : textColor }}>{entry}</Text>
                                    {city === entry && <IconSymbol name="checkmark" size={14} color={primaryColor} />}
                                </Pressable>
                            ))}
                        </ScrollView>
                    </Box>
                )}
            </VStack>

            <Button 
                className="h-16 rounded-[24px] mt-6 shadow-lg" 
                style={{ backgroundColor: primaryColor }}
                onPress={handleSubmit} 
                disabled={isPending}
            >
                {isPending ? (
                    <Spinner color="#fff" size="small" />
                ) : (
                    <ButtonText className="text-base font-extrabold uppercase tracking-widest">
                        {profile ? 'Update Profile' : 'Save & Continue'}
                    </ButtonText>
                )}
            </Button>
          </VStack>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}
