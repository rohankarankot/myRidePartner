import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { userService } from '@/services/user-service';
import { useAuth } from '@/context/auth-context';
import { useBlockedUsers } from '@/features/safety/hooks/use-blocked-users';
import { saveReport } from '@/features/safety/report-service';
import { CustomAlert } from '@/components/CustomAlert';
import { ReportModal, ReportPayload } from '@/features/safety/components/ReportModal';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Divider } from '@/components/ui/divider';
import { ProfileSkeleton } from '@/features/profile/components/ProfileSkeleton';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const userId = Number(id);
  const router = useRouter();
  const { user } = useAuth();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');
  const dangerColor = useThemeColor({}, 'danger');

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBlockAlert, setShowBlockAlert] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { isBlocked, blockUser, unblockUser, isBlocking, isUnblocking } = useBlockedUsers();

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => userService.getUserProfile(userId),
    enabled: !Number.isNaN(userId),
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const avatarUrl =
    !profile?.avatar ? null : typeof profile.avatar === 'string' ? profile.avatar : profile.avatar.url;
  const blocked = isBlocked(userId);
  const isOwnProfile = user?.id === userId;

  const handleReportSubmit = async (payload: ReportPayload) => {
    await saveReport(payload);
    Toast.show({
      type: 'success',
      text1: 'Report submitted',
      text2: 'We will review this and take action if needed.',
    });
  };

  const handleConfirmBlock = async () => {
    try {
      if (blocked) {
        await unblockUser(userId);
        Toast.show({
          type: 'success',
          text1: 'User unblocked',
          text2: 'Their rides can appear again in discovery.',
        });
      } else {
        await blockUser(userId);
        Toast.show({
          type: 'success',
          text1: 'User blocked',
          text2: 'You will no longer see their rides in discovery on this device.',
        });
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Action failed',
        text2: 'Please try again.',
      });
    } finally {
      setShowBlockAlert(false);
    }
  };

  const screenOptions = {
    title: profile?.fullName || 'Profile',
    headerTitleStyle: { fontWeight: 'bold' },
    headerShown: true,
    headerStyle: { backgroundColor },
    headerTintColor: textColor,
    headerShadowVisible: false,
    headerBackTitle: 'Back',
  } as const;

  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['bottom']}>
        <Stack.Screen options={screenOptions} />
        <ProfileSkeleton />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['bottom']}>
        <Stack.Screen options={screenOptions} />
        <VStack className="flex-1 items-center justify-center px-10" space="md">
            <Box className="w-20 h-20 rounded-full bg-gray-50 items-center justify-center mb-2">
                <IconSymbol name="person.crop.circle.badge.exclamationmark" size={40} color={subtextColor} />
            </Box>
          <Text className="text-xl font-extrabold text-center" style={{ color: textColor }}>
            User profile not found
          </Text>
          <Text className="text-sm text-center leading-6" style={{ color: subtextColor }}>
            We couldn&apos;t retrieve the information for this user. They might have deleted their account or it&apos;s temporarily unavailable.
          </Text>
        </VStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['bottom']}>
      <ReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
        reportedUserId={userId}
        reportedUserName={profile?.fullName}
        reporterUserId={user?.id}
        source="profile"
      />

      <CustomAlert
        visible={showBlockAlert}
        title={blocked ? 'Unblock user?' : 'Block user?'}
        message={
          blocked
            ? 'This will allow their rides to appear in discovery again on this device.'
            : 'You will hide this user’s rides from discovery on this device. You can undo this later.'
        }
        primaryButton={{ text: blocked ? 'Unblock' : 'Block', onPress: handleConfirmBlock }}
        secondaryButton={{ text: 'Cancel', onPress: () => setShowBlockAlert(false) }}
        onClose={() => setShowBlockAlert(false)}
        icon={blocked ? 'person.crop.circle.badge.checkmark' : 'hand.raised.fill'}
      />

      <Stack.Screen options={screenOptions} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={primaryColor} />}
      >
        <VStack className="px-6 py-8 items-center" space="xl">
          <Box className="relative">
            <Avatar size="2xl" className="border-4" style={{ borderColor: cardColor }}>
              <AvatarFallbackText>{profile.fullName || '?'}</AvatarFallbackText>
              {avatarUrl ? <AvatarImage source={{ uri: avatarUrl }} alt={profile.fullName || 'User'} /> : null}
            </Avatar>
            {profile.isVerified && (
              <Box className="absolute bottom-1 right-1 w-8 h-8 rounded-full items-center justify-center border-4" style={{ backgroundColor: '#10B981', borderColor: cardColor }}>
                <IconSymbol name="checkmark" size={14} color="#fff" />
              </Box>
            )}
          </Box>

          <VStack className="items-center" space="xs">
            <Text className="text-3xl font-extrabold text-center" style={{ color: textColor }}>
                {profile.fullName || 'Unknown User'}
            </Text>
            <Box className="px-3 py-1 rounded-full border border-dashed" style={{ borderColor: primaryColor }}>
                <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
                    Ride Leader
                </Text>
            </Box>
          </VStack>

          {!isOwnProfile && (
            <HStack className="w-full" space="md">
              <Pressable
                className="flex-1 h-14 rounded-2xl flex-row items-center justify-center border"
                style={{ backgroundColor: blocked ? `${dangerColor}10` : cardColor, borderColor: blocked ? dangerColor : borderColor }}
                onPress={() => setShowBlockAlert(true)}
                disabled={isBlocking || isUnblocking}
              >
                <IconSymbol
                  name={blocked ? 'person.crop.circle.badge.checkmark' : 'hand.raised.fill'}
                  size={16}
                  color={blocked ? dangerColor : textColor}
                />
                <Text className="text-sm font-extrabold ml-2 uppercase tracking-tight" style={{ color: blocked ? dangerColor : textColor }}>
                  {blocked ? 'Unblock' : 'Block'}
                </Text>
              </Pressable>

              <Pressable
                className="flex-1 h-14 rounded-2xl flex-row items-center justify-center border"
                style={{ backgroundColor: cardColor, borderColor }}
                onPress={() => setShowReportModal(true)}
              >
                <IconSymbol name="flag.fill" size={16} color="#F59E0B" />
                <Text className="text-sm font-extrabold ml-2 uppercase tracking-tight" style={{ color: textColor }}>
                  Report
                </Text>
              </Pressable>
            </HStack>
          )}

          <HStack className="w-full justify-between items-center bg-transparent px-2">
            <Pressable className="items-center flex-1" onPress={() => router.push(`/ratings?userId=${userId}`)}>
              <VStack className="items-center" space="xs">
                <Box className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: `${primaryColor}10` }}>
                    <IconSymbol name="star.fill" size={20} color="#F59E0B" />
                </Box>
                <Text className="text-xl font-extrabold" style={{ color: textColor }}>
                   {profile.rating ? Number(profile.rating).toFixed(1) : 'New'}
                </Text>
                <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: subtextColor }}>Rating</Text>
              </VStack>
            </Pressable>

            <Divider className="h-12 w-px" style={{ backgroundColor: borderColor }} />

            <VStack className="items-center flex-1" space="xs">
                <Box className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: `${primaryColor}10` }}>
                    <IconSymbol name="car.fill" size={20} color={primaryColor} />
                </Box>
                <Text className="text-xl font-extrabold" style={{ color: textColor }}>
                   {profile.completedTripsCount || 0}
                </Text>
                <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: subtextColor }}>Rides</Text>
            </VStack>

            <Divider className="h-12 w-px" style={{ backgroundColor: borderColor }} />

            <Pressable className="items-center flex-1" onPress={() => router.push(`/ratings?userId=${userId}`)}>
              <VStack className="items-center" space="xs">
                <Box className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: `${primaryColor}10` }}>
                    <IconSymbol name="person.2.fill" size={20} color="#6366F1" />
                </Box>
                <Text className="text-xl font-extrabold" style={{ color: textColor }}>
                   {profile.ratingsCount || 0}
                </Text>
                <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: subtextColor }}>Reviews</Text>
              </VStack>
            </Pressable>
          </HStack>

          <VStack className="w-full" space="md">
            <Text className="text-[10px] font-extrabold uppercase tracking-widest ml-2" style={{ color: subtextColor }}>About</Text>
            <Box className="rounded-[32px] p-6 border" style={{ backgroundColor: cardColor, borderColor }}>
                <VStack space="xl">
                    <HStack className="items-center" space="lg">
                        <Box className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: profile.gender === 'men' ? '#3B82F6' : profile.gender === 'women' ? '#EC4899' :  subtextColor }}>
                            <IconSymbol name="person.fill" size={18} color="#fff" />
                        </Box>
                        <VStack >
                            <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>Gender</Text>
                            <Text className="text-base font-bold capitalize" style={{ color: textColor }}>{profile.gender || 'Not specified'}</Text>
                        </VStack>
                    </HStack>

                    {profile.city && (
                        <>
                            <Divider style={{ backgroundColor: borderColor }} />
                            <HStack className="items-center" space="lg">
                                <Box className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: '#F59E0B' }}>
                                    <IconSymbol name="mappin.circle.fill" size={18} color="#fff" />
                                </Box>
                                <VStack >
                                    <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>City</Text>
                                    <Text className="text-base font-bold" style={{ color: textColor }}>{profile.city}</Text>
                                </VStack>
                            </HStack>
                        </>
                    )}
                </VStack>
            </Box>
          </VStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
