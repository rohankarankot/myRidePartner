import React, { useState, useCallback, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import TextRecognition from 'react-native-text-recognition';
import {
  View,
  Text as RNText,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
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
};

function ActionRow({
  icon,
  label,
  iconColor,
  iconBackground,
  textColor,
  chevronColor,
  onPress,
}: ActionRowProps) {
  return (
    <Pressable className="py-1" onPress={onPress}>
      <HStack className="items-center justify-between">
        <HStack space="md" className="items-center">
          <Box
            className="h-10 w-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: iconBackground }}
          >
            <IconSymbol name={icon as any} size={16} color={iconColor} />
          </Box>
          <Text className="text-base font-medium" style={{ color: textColor }}>
            {label}
          </Text>
        </HStack>
        <IconSymbol name="chevron.right" size={16} color={chevronColor} />
      </HStack>
    </Pressable>
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
      <Box className="flex-1 items-center justify-center px-6" style={{ backgroundColor }}>
        <Text className="mb-4 text-center text-lg font-semibold" style={{ color: dangerColor }}>
          Failed to load profile
        </Text>
        <Button onPress={() => refetch()}>
          <ButtonText>Retry</ButtonText>
        </Button>
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
    <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Profile',
          headerShown: true,
          headerTransparent: false,
          headerStyle: { backgroundColor: cardColor },
          headerTintColor: textColor,
          headerShadowVisible: false,
          headerRight: () =>
            profile ? (
              <TouchableOpacity style={{ marginRight: 16 }} onPress={() => router.push('/settings')}>
                <IconSymbol name="gearshape.fill" size={24} color={primaryColor} />
              </TouchableOpacity>
            ) : null,
        }}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={primaryColor}
            colors={[primaryColor]}
          />
        }
      >
        <VStack className="items-center pb-6" space="sm">
          <Pressable onPress={handlePickImage} disabled={isUploadingAvatar} className="relative mb-1">
            <Avatar size="2xl">
              <AvatarFallbackText>{initials || 'MR'}</AvatarFallbackText>
              <AvatarImage
                source={avatarUrl ? { uri: avatarUrl } : { uri: DUMMY_AVATAR }}
                alt={name}
              />
            </Avatar>
            {isUploadingAvatar ? (
              <Box style={styles.avatarOverlay} className="items-center justify-center">
                <Spinner color="#fff" size="small" />
              </Box>
            ) : (
              <Box
                style={[styles.avatarEditIcon, { backgroundColor: primaryColor }]}
                className="items-center justify-center"
              >
                <IconSymbol name="camera.fill" size={14} color="#fff" />
              </Box>
            )}
          </Pressable>

          <Text className="text-center text-2xl font-bold" style={{ color: textColor }}>
            {name}
          </Text>

          {profile?.city ? (
            <HStack space="xs" className="items-center mt-1">
              <IconSymbol name="mappin.circle.fill" size={12} color={primaryColor} />
              <Text className="text-sm font-medium" style={{ color: subtextColor }}>
                {profile.city}
              </Text>
            </HStack>
          ) : null}

          <Text className="mt-1 text-sm text-center" style={{ color: subtextColor }}>
            {user?.email}
          </Text>

          {!profile ? (
            <Pressable
              className="mt-3 rounded-full px-4 py-2"
              style={{ backgroundColor: `${primaryColor}15` }}
              onPress={handlePresentModalPress}
            >
              <Text className="font-semibold" style={{ color: primaryColor }}>
                Complete your profile →
              </Text>
            </Pressable>
          ) : isVerified ? (
            <VStack className="items-center mt-2" space="sm">
              <Box className="rounded-full px-3 py-1" style={{ backgroundColor: successBgColor }}>
                <Text className="text-xs font-semibold" style={{ color: successColor }}>
                  Verified
                </Text>
              </Box>
              {isGovernmentIdVerified ? (
                <HStack
                  space="xs"
                  className="items-center rounded-full px-3 py-1.5"
                  style={{ backgroundColor: `${primaryColor}14` }}
                >
                  <IconSymbol name="checkmark.shield.fill" size={12} color={primaryColor} />
                  <Text className="text-xs font-bold" style={{ color: primaryColor }}>
                    Government ID verified
                  </Text>
                </HStack>
              ) : null}
            </VStack>
          ) : (
            <VStack className="items-center mt-2" space="sm">
              <Box className="rounded-full px-3 py-1" style={{ backgroundColor: dangerBgColor }}>
                <Text className="text-xs font-semibold" style={{ color: dangerColor }}>
                  Unverified
                </Text>
              </Box>
              <Pressable onPress={handleVerifyNow} disabled={isVerifyingGovernmentId}>
                <Text className="font-semibold" style={{ color: primaryColor }}>
                  {isVerifyingGovernmentId ? 'Verifying Aadhaar...' : 'Verify now?'}
                </Text>
              </Pressable>
              {isVerifyingGovernmentId ? (
                <HStack space="sm" className="items-center px-4">
                  <Spinner size="small" color={primaryColor} />
                  <Text className="flex-1 text-center text-xs leading-5" style={{ color: subtextColor }}>
                    Running OCR, uploading ID, and updating your verification status...
                  </Text>
                </HStack>
              ) : null}
            </VStack>
          )}
        </VStack>

        <Box className="rounded-2xl p-4 mb-5" style={[styles.cardShadow, { backgroundColor: cardColor }]}>
          <Text className="text-base font-semibold mb-3" style={{ color: textColor }}>
            Statistics
          </Text>

          <Pressable className="py-1" onPress={() => router.push('/ratings')}>
            <HStack className="items-center justify-between">
              <HStack space="sm" className="items-center">
                <IconSymbol name="star.fill" size={14} color="#F59E0B" />
                <Text className="text-sm" style={{ color: subtextColor }}>
                  Rating
                </Text>
              </HStack>
              <HStack space="sm" className="items-center">
                <Text className="text-sm font-medium" style={{ color: textColor }}>
                  {Number(rating).toFixed(1)}
                </Text>
                <IconSymbol name="chevron.right" size={12} color={subtextColor} />
              </HStack>
            </HStack>
          </Pressable>

          <Pressable
            className="pt-4"
            onPress={() => router.push({ pathname: '/my-activity', params: { tab: 'completed' } })}
          >
            <HStack className="items-center justify-between">
              <HStack space="sm" className="items-center">
                <IconSymbol name="flag.checkered" size={14} color={primaryColor} />
                <Text className="text-sm" style={{ color: subtextColor }}>
                  Completed Trips
                </Text>
              </HStack>
              <HStack space="sm" className="items-center">
                <Text className="text-sm font-medium" style={{ color: textColor }}>
                  {completedTripsCount}
                </Text>
                <IconSymbol name="chevron.right" size={12} color={subtextColor} />
              </HStack>
            </HStack>
          </Pressable>
        </Box>

        <Box className="rounded-2xl p-4 mb-5" style={[styles.cardShadow, { backgroundColor: cardColor }]}>
          <Text className="text-base font-semibold mb-3" style={{ color: textColor }}>
            Account Information
          </Text>

          <HStack className="justify-between mb-3">
            <HStack space="sm" className="items-center">
              <IconSymbol name="at" size={14} color={subtextColor} />
              <Text className="text-sm" style={{ color: subtextColor }}>
                Username
              </Text>
            </HStack>
            <Text className="text-sm font-medium" style={{ color: textColor }}>
              {user?.username}
            </Text>
          </HStack>

          <HStack className="justify-between mb-3">
            <HStack space="sm" className="items-center">
              <IconSymbol name="phone.fill" size={14} color="#10B981" />
              <Text className="text-sm" style={{ color: subtextColor }}>
                Phone
              </Text>
            </HStack>
            <Text className="text-sm font-medium" style={{ color: textColor }}>
              {phone}
            </Text>
          </HStack>

          <HStack className="justify-between mb-3">
            <HStack space="sm" className="items-center">
              <IconSymbol
                name="person.fill"
                size={14}
                color={
                  profileGender === 'men'
                    ? '#3B82F6'
                    : profileGender === 'women'
                      ? '#EC4899'
                      : '#94A3B8'
                }
              />
              <Text className="text-sm" style={{ color: subtextColor }}>
                Gender
              </Text>
            </HStack>
            <Text className="text-sm font-medium" style={{ color: textColor }}>
              {profileGender ? (profileGender === 'men' ? 'Male' : 'Female') : 'N/A'}
            </Text>
          </HStack>

          <HStack className="justify-between mb-3">
            <HStack space="sm" className="items-center">
              <IconSymbol name="envelope.fill" size={14} color="#3B82F6" />
              <Text className="text-sm" style={{ color: subtextColor }}>
                Email
              </Text>
            </HStack>
            <Text
              className="text-sm font-medium max-w-[55%] text-right"
              style={{ color: textColor }}
              numberOfLines={2}
            >
              {user?.email}
            </Text>
          </HStack>

          {profile?.city ? (
            <HStack className="justify-between mb-3">
              <HStack space="sm" className="items-center">
                <IconSymbol name="mappin.circle.fill" size={14} color="#F59E0B" />
                <Text className="text-sm" style={{ color: subtextColor }}>
                  City
                </Text>
              </HStack>
              <Text className="text-sm font-bold" style={{ color: textColor }}>
                {profile.city}
              </Text>
            </HStack>
          ) : null}

          {aadhaarNumber ? (
            <HStack className="justify-between">
              <HStack space="sm" className="items-center">
                <IconSymbol name="checkmark.shield.fill" size={14} color={successColor} />
                <Text className="text-sm" style={{ color: subtextColor }}>
                  Aadhaar
                </Text>
              </HStack>
              <Text className="text-sm font-bold" style={{ color: textColor }}>
                {maskAadhaarNumber(aadhaarNumber)}
              </Text>
            </HStack>
          ) : null}
        </Box>

        <Box className="rounded-2xl p-4 mb-5" style={[styles.cardShadow, { backgroundColor: cardColor }]}>
          <ActionRow
            icon="pencil"
            label={!profile ? 'Complete Profile' : 'Edit Profile'}
            iconColor={primaryColor}
            iconBackground={`${primaryColor}15`}
            textColor={textColor}
            chevronColor={subtextColor}
            onPress={handlePresentModalPress}
          />
          <Divider className="my-3" style={{ backgroundColor: borderColor }} />
          <ActionRow
            icon="chart.bar.fill"
            label="Show Analytics"
            iconColor={primaryColor}
            iconBackground={`${primaryColor}15`}
            textColor={textColor}
            chevronColor={subtextColor}
            onPress={() => router.push('/profile-analytics')}
          />
          <Divider className="my-3" style={{ backgroundColor: borderColor }} />
          <ActionRow
            icon="flag.checkered"
            label="My Activity"
            iconColor={primaryColor}
            iconBackground={`${primaryColor}15`}
            textColor={textColor}
            chevronColor={subtextColor}
            onPress={() => router.push('/my-activity')}
          />
          <Divider className="my-3" style={{ backgroundColor: borderColor }} />
          <ActionRow
            icon="bell.fill"
            label="Notifications"
            iconColor="#F87171"
            iconBackground="#F8717115"
            textColor={textColor}
            chevronColor={subtextColor}
            onPress={() => router.push('/notifications')}
          />
          <Divider className="my-3" style={{ backgroundColor: borderColor }} />
          <ActionRow
            icon="rectangle.portrait.and.arrow.right"
            label="Sign Out"
            iconColor={dangerColor}
            iconBackground={`${dangerColor}15`}
            textColor={dangerColor}
            chevronColor={subtextColor}
            onPress={() => setShowSignOutModal(true)}
          />
        </Box>
      </ScrollView>

      <Modal
        visible={showSignOutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSignOutModal(false)}
      >
        <Box style={styles.signOutOverlay}>
          <Box style={[styles.signOutModal, { backgroundColor: cardColor }]}>
            <Box style={[styles.signOutIconWrap, { backgroundColor: `${dangerColor}12` }]}>
              <IconSymbol
                name="rectangle.portrait.and.arrow.right"
                size={28}
                color={dangerColor}
              />
            </Box>
            <Text style={[styles.signOutTitle, { color: textColor }]}>Sign Out?</Text>
            <Text style={[styles.signOutSubtitle, { color: subtextColor }]}>
              You&apos;ll need to log back in to access your account.
            </Text>
            <HStack space="md" style={styles.signOutActions}>
              <Button
                variant="outline"
                className="flex-1"
                style={{ borderColor, borderWidth: 1.5 }}
                onPress={() => setShowSignOutModal(false)}
              >
                <ButtonText style={{ color: textColor }}>Cancel</ButtonText>
              </Button>
              <Button
                action="negative"
                className="flex-1"
                onPress={() => {
                  setShowSignOutModal(false);
                  signOut();
                }}
              >
                <ButtonText>Sign Out</ButtonText>
              </Button>
            </HStack>
          </Box>
        </Box>
      </Modal>

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
        <BottomSheetScrollView contentContainerStyle={styles.modalContent}>
          <View style={styles.modalHeaderRow}>
            <RNText style={[styles.modalTitle, { color: textColor }]}>
              {profile ? 'Edit Profile' : 'Complete Profile'}
            </RNText>
            <TouchableOpacity onPress={() => bottomSheetModalRef.current?.dismiss()}>
              <IconSymbol name="xmark" size={20} color={subtextColor} />
            </TouchableOpacity>
          </View>

          <RNText style={[styles.modalLabel, { color: subtextColor }]}>FULL NAME</RNText>
          <BottomSheetTextInput
            style={[styles.input, { color: textColor, borderColor }]}
            placeholder="John Doe"
            placeholderTextColor={subtextColor}
            value={fullName}
            onChangeText={setFullName}
          />

          <RNText style={[styles.modalLabel, { color: subtextColor, marginTop: 16 }]}>
            PHONE NUMBER
          </RNText>
          <BottomSheetTextInput
            style={[styles.input, { color: textColor, borderColor }]}
            placeholder="+91 9876543210"
            placeholderTextColor={subtextColor}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />

          <RNText style={[styles.modalLabel, { color: subtextColor, marginTop: 16 }]}>
            GENDER
          </RNText>
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                { borderColor },
                gender === 'men' && { backgroundColor: primaryColor, borderColor: primaryColor },
              ]}
              onPress={() => setGender('men')}
            >
              <RNText
                style={[
                  styles.genderButtonText,
                  gender === 'men' ? { color: '#fff' } : { color: textColor },
                ]}
              >
                Male
              </RNText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderButton,
                { borderColor },
                gender === 'women' && { backgroundColor: primaryColor, borderColor: primaryColor },
              ]}
              onPress={() => setGender('women')}
            >
              <RNText
                style={[
                  styles.genderButtonText,
                  gender === 'women' ? { color: '#fff' } : { color: textColor },
                ]}
              >
                Female
              </RNText>
            </TouchableOpacity>
          </View>

          <RNText style={[styles.modalLabel, { color: subtextColor, marginTop: 16 }]}>
            CITY
          </RNText>
          <TouchableOpacity
            style={[styles.input, { borderColor, justifyContent: 'center' }]}
            onPress={() => setShowCityPicker(!showCityPicker)}
          >
            <View style={styles.citySelectorRow}>
              <RNText style={{ color: city ? textColor : subtextColor, fontSize: 16 }}>
                {city || 'Select your city'}
              </RNText>
              <IconSymbol name="chevron.down" size={16} color={subtextColor} />
            </View>
          </TouchableOpacity>

          {showCityPicker ? (
            <View
              style={[
                styles.cityPickerCard,
                {
                  backgroundColor: `${subtextColor}05`,
                  borderColor: `${borderColor}50`,
                },
              ]}
            >
              <BottomSheetTextInput
                style={[
                  styles.input,
                  {
                    height: 44,
                    marginBottom: 8,
                    borderColor: `${borderColor}30`,
                    fontSize: 14,
                    backgroundColor: cardColor,
                  },
                ]}
                placeholder="Search city..."
                placeholderTextColor={subtextColor}
                value={citySearch}
                onChangeText={setCitySearch}
                autoFocus={false}
              />
              <ScrollView nestedScrollEnabled style={{ maxHeight: 180 }}>
                {CITIES.filter((entry) =>
                  entry.toLowerCase().includes(citySearch.toLowerCase())
                ).map((entry) => (
                  <TouchableOpacity
                    key={entry}
                    style={[
                      styles.cityOption,
                      { backgroundColor: city === entry ? `${primaryColor}10` : 'transparent' },
                    ]}
                    onPress={() => selectCity(entry)}
                  >
                    <RNText
                      style={{
                        fontSize: 15,
                        color: city === entry ? primaryColor : textColor,
                        fontWeight: city === entry ? '700' : '400',
                      }}
                    >
                      {entry}
                    </RNText>
                    {city === entry ? (
                      <IconSymbol name="checkmark" size={14} color={primaryColor} />
                    ) : null}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: primaryColor, marginTop: 24 }]}
            onPress={handleSubmit}
            disabled={isPending}
          >
            {isPending ? (
              <Spinner color="#fff" size="small" />
            ) : (
              <RNText style={styles.saveButtonText}>
                {profile ? 'Update Profile' : 'Save Profile'}
              </RNText>
            )}
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 64,
  },
  avatarEditIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#fff',
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  modalContent: {
    padding: 24,
    paddingBottom: 40,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    height: 56,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  citySelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cityPickerCard: {
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 250,
    borderWidth: 1,
    padding: 8,
  },
  cityOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  signOutOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  signOutModal: {
    width: '100%',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
  },
  signOutIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  signOutTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  signOutSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  signOutActions: {
    width: '100%',
  },
});
