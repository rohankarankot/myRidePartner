import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
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
import { ReportModal, ReportPayload } from '@/components/ReportModal';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';

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
    headerShown: true,
    headerStyle: { backgroundColor },
    headerTintColor: textColor,
    headerShadowVisible: false,
    headerBackTitle: 'Back',
  };

  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
        <Stack.Screen options={screenOptions} />
        <Box className="flex-1 items-center justify-center">
          <Spinner size="large" color={primaryColor} />
        </Box>
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
        <Stack.Screen options={screenOptions} />
        <Box className="flex-1 items-center justify-center px-8">
          <IconSymbol name="person.fill" size={64} color={subtextColor} />
          <Text className="text-base font-medium mt-4 text-center" style={{ color: textColor }}>
            User profile not found.
          </Text>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['bottom']}>
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
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={primaryColor} />}
      >
        <Box className="rounded-3xl p-6 items-center" style={[styles.cardShadow, { backgroundColor: cardColor }]}>
          <Box className="relative mb-4">
            <Avatar size="2xl">
              <AvatarFallbackText>{profile.fullName || '?'}</AvatarFallbackText>
              {avatarUrl ? <AvatarImage source={{ uri: avatarUrl }} alt={profile.fullName || 'User'} /> : null}
            </Avatar>
            {profile.isVerified ? (
              <Box className="absolute bottom-0 right-0 w-7 h-7 rounded-full items-center justify-center border-[3px]" style={{ backgroundColor: '#10B981', borderColor: cardColor }}>
                <IconSymbol name="checkmark" size={12} color="#fff" />
              </Box>
            ) : null}
          </Box>

          <Text className="text-2xl font-bold mb-1 text-center" style={{ color: textColor }}>
            {profile.fullName || 'Unknown User'}
          </Text>
          <Text className="text-sm mb-6" style={{ color: subtextColor }}>
            Ride Leader
          </Text>

          {!isOwnProfile ? (
            <VStack className="w-full mb-5" space="sm">
              <Pressable
                className="rounded-2xl min-h-[46px] px-4 flex-row items-center justify-center"
                style={{ backgroundColor: blocked ? `${dangerColor}10` : cardColor, borderColor, borderWidth: 1 }}
                onPress={() => setShowBlockAlert(true)}
                disabled={isBlocking || isUnblocking}
              >
                <IconSymbol
                  name={blocked ? 'person.crop.circle.badge.checkmark' : 'hand.raised.fill'}
                  size={16}
                  color={blocked ? dangerColor : textColor}
                />
                <Text className="text-sm font-semibold ml-2" style={{ color: blocked ? dangerColor : textColor }}>
                  {blocked ? 'Unblock User' : 'Block User'}
                </Text>
              </Pressable>

              <Pressable
                className="rounded-2xl min-h-[46px] px-4 flex-row items-center justify-center"
                style={{ backgroundColor: cardColor, borderColor, borderWidth: 1 }}
                onPress={() => setShowReportModal(true)}
              >
                <IconSymbol name="flag.fill" size={16} color="#F59E0B" />
                <Text className="text-sm font-semibold ml-2" style={{ color: textColor }}>
                  Report User
                </Text>
              </Pressable>
            </VStack>
          ) : null}

          <HStack className="w-full items-center justify-center pt-5" style={{ borderTopColor: 'rgba(150,150,150,0.1)', borderTopWidth: 1 }}>
            <Pressable className="flex-1 items-center" onPress={() => router.push(`/ratings?userId=${userId}`)}>
              <Box className="w-10 h-10 rounded-full items-center justify-center mb-2" style={{ backgroundColor: `${primaryColor}15` }}>
                <IconSymbol name="star.fill" size={20} color="#F59E0B" />
              </Box>
              <Text className="text-lg font-bold mb-0.5" style={{ color: textColor }}>
                {profile.rating ? Number(profile.rating).toFixed(1) : 'New'}
              </Text>
              <Text className="text-xs text-center" style={{ color: subtextColor }}>
                Rating
              </Text>
            </Pressable>

            <Box className="w-px h-10" style={{ backgroundColor: 'rgba(150,150,150,0.2)' }} />

            <Box className="flex-1 items-center">
              <Box className="w-10 h-10 rounded-full items-center justify-center mb-2" style={{ backgroundColor: `${primaryColor}15` }}>
                <IconSymbol name="car.fill" size={20} color={primaryColor} />
              </Box>
              <Text className="text-lg font-bold mb-0.5" style={{ color: textColor }}>
                {profile.completedTripsCount || 0}
              </Text>
              <Text className="text-xs text-center" style={{ color: subtextColor }}>
                Completed Rides
              </Text>
            </Box>

            <Box className="w-px h-10" style={{ backgroundColor: 'rgba(150,150,150,0.2)' }} />

            <Pressable className="flex-1 items-center" onPress={() => router.push(`/ratings?userId=${userId}`)}>
              <Box className="w-10 h-10 rounded-full items-center justify-center mb-2" style={{ backgroundColor: '#6366F115' }}>
                <IconSymbol name="person.2.fill" size={20} color="#6366F1" />
              </Box>
              <Text className="text-lg font-bold mb-0.5" style={{ color: textColor }}>
                {profile.ratingsCount || 0}
              </Text>
              <Text className="text-xs text-center" style={{ color: subtextColor }}>
                Reviews
              </Text>
            </Pressable>
          </HStack>
        </Box>

        <Text className="text-xs font-semibold ml-4 mt-6 mb-2 uppercase" style={{ color: subtextColor }}>
          About
        </Text>
        <Box className="rounded-3xl p-4" style={[styles.cardShadow, { backgroundColor: cardColor }]}>
          <HStack className="items-center">
            <Box
              className="w-10 h-10 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: profile.gender === 'men' ? '#3B82F615' : profile.gender === 'women' ? '#EC489915' : '#94A3B815' }}
            >
              <IconSymbol
                name="person.fill"
                size={20}
                color={profile.gender === 'men' ? '#3B82F6' : profile.gender === 'women' ? '#EC4899' : '#94A3B8'}
              />
            </Box>
            <VStack className="flex-1">
              <Text className="text-xs mb-0.5" style={{ color: subtextColor }}>
                Gender
              </Text>
              <Text className="text-base font-medium" style={{ color: textColor }}>
                {profile.gender === 'men' ? 'Male' : profile.gender === 'women' ? 'Female' : 'Not specified'}
              </Text>
            </VStack>
          </HStack>

          {profile.city ? (
            <>
              <Box className="h-px my-3 ml-14" style={{ backgroundColor: borderColor, opacity: 0.5 }} />
              <HStack className="items-center">
                <Box className="w-10 h-10 rounded-full items-center justify-center mr-4" style={{ backgroundColor: '#F59E0B15' }}>
                  <IconSymbol name="mappin.circle.fill" size={20} color="#F59E0B" />
                </Box>
                <VStack className="flex-1">
                  <Text className="text-xs mb-0.5" style={{ color: subtextColor }}>
                    City
                  </Text>
                  <Text className="text-base font-medium" style={{ color: textColor }}>
                    {profile.city}
                  </Text>
                </VStack>
              </HStack>
            </>
          ) : null}
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  cardShadow: {
    shadowColor: '#2A120B',
    shadowOpacity: 0.05,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
});
