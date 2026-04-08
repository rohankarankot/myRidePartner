import React from 'react';
import { ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useQueries } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import { userService } from '@/features/auth/api/user-service';
import { useBlockedUsers } from '@/features/safety/hooks/use-blocked-users';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CustomAlert } from '@/components/CustomAlert';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Divider } from '@/components/ui/divider';

export default function BlockedUsersScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  const { blockedUserIds, isLoading, unblockUser, isUnblocking } = useBlockedUsers();
  const [pendingUnblockUserId, setPendingUnblockUserId] = React.useState<number | null>(null);

  const blockedUserQueries = useQueries({
    queries: blockedUserIds.map((userId) => ({
      queryKey: ['blocked-user-profile', userId],
      queryFn: () => userService.getUserProfile(userId),
      enabled: blockedUserIds.length > 0,
      staleTime: 60_000,
    })),
  });

  const blockedUsers = blockedUserIds.map((userId, index) => ({
    userId,
    profile: blockedUserQueries[index]?.data ?? null,
    isProfileLoading: blockedUserQueries[index]?.isLoading ?? false,
  }));

  const handleUnblock = async (userId: number) => {
    try {
      await unblockUser(userId);
      Toast.show({
        type: 'success',
        text1: 'User unblocked',
        text2: 'They can appear in discovery again.',
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Unblock failed',
        text2: 'Please try again.',
      });
    } finally {
      setPendingUnblockUserId(null);
    }
  };

  const pendingUnblockUser = blockedUsers.find((user) => user.userId === pendingUnblockUserId);
  const pendingDisplayName =
    pendingUnblockUser?.profile?.fullName ||
    (pendingUnblockUserId ? `User #${pendingUnblockUserId}` : 'this user');

  return (
    <ScrollView style={{ flex: 1, backgroundColor }} contentContainerStyle={{ paddingBottom: 40 }}>
      <Stack.Screen options={{ title: 'Blocked Users', headerTitleStyle: { fontWeight: '800' } }} />

      <VStack className="px-6 py-8" space="xs">
          <Text className="text-3xl font-extrabold" style={{ color: textColor }}>Privacy Center</Text>
          <Text className="text-sm font-medium" style={{ color: subtextColor }}>Manage the accounts you've restricted from interacting with you.</Text>
      </VStack>

      <Box className="mx-6 rounded-[32px] p-6 mb-6 shadow-sm border" style={{ backgroundColor: cardColor, borderColor }}>
        <Text className="text-[10px] font-extrabold uppercase tracking-widest mb-4" style={{ color: subtextColor }}>
          Blocked Accounts
        </Text>

        {isLoading ? (
          <Box className="min-h-[200px] items-center justify-center">
            <Spinner color={primaryColor} />
          </Box>
        ) : blockedUsers.length === 0 ? (
          <VStack className="min-h-[200px] items-center justify-center px-6" space="md">
            <Box className="w-16 h-16 rounded-full bg-gray-50 items-center justify-center mb-2">
                <IconSymbol name="checkmark.shield.fill" size={32} color={primaryColor} />
            </Box>
            <Text className="text-xl font-extrabold text-center" style={{ color: textColor }}>
              All Clear
            </Text>
            <Text className="text-sm font-medium text-center leading-6" style={{ color: subtextColor }}>
              No accounts are currently blocked. Your safety and community trust are our priority.
            </Text>
          </VStack>
        ) : (
          <VStack className="rounded-[24px] overflow-hidden border" style={{ borderColor }}>
            {blockedUsers.map(({ userId, profile, isProfileLoading }, index) => {
              const avatarUri =
                typeof profile?.avatar === 'string' ? profile.avatar : profile?.avatar?.url;
              const displayName = profile?.fullName || `User #${userId}`;
              const subtitle = profile?.city || 'Blocked account';

              return (
                <VStack key={userId} >
                  <HStack className="items-center justify-between p-4" space="md">
                    <HStack className="items-center flex-1" space="md">
                      <Avatar size="md" className="border shadow-sm" style={{ borderColor }}>
                        <AvatarFallbackText>{displayName}</AvatarFallbackText>
                        {avatarUri ? <AvatarImage source={{ uri: avatarUri }} alt={displayName} /> : null}
                      </Avatar>

                      <VStack className="flex-1" space="xs">
                        <Text className="text-base font-bold" style={{ color: textColor }} numberOfLines={1}>
                          {displayName}
                        </Text>
                        <Text className="text-xs font-medium" style={{ color: subtextColor }} numberOfLines={1}>
                          {isProfileLoading ? 'Loading profile...' : subtitle}
                        </Text>
                      </VStack>
                    </HStack>

                    <Pressable
                      className="rounded-xl px-4 py-2 border shadow-sm"
                      style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}10` }}
                      onPress={() => setPendingUnblockUserId(userId)}
                      disabled={isUnblocking}
                    >
                      <Text className="text-xs font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
                        Unblock
                      </Text>
                    </Pressable>
                  </HStack>
                  {index < blockedUsers.length - 1 ? <Divider style={{ backgroundColor: borderColor }} className="mx-4" /> : null}
                </VStack>
              );
            })}
          </VStack>
        )}
      </Box>

      <VStack className="items-center py-10" space="xs">
          <Divider className="w-12 mb-4" style={{ backgroundColor: borderColor }} />
        <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
          Manage your interactions securely
        </Text>
      </VStack>

      <CustomAlert
        visible={pendingUnblockUserId !== null}
        title="Unblock user?"
        message={`${pendingDisplayName} will be able to appear in discovery and interact with you again.`}
        icon="person.crop.circle.badge.checkmark"
        onClose={() => setPendingUnblockUserId(null)}
        primaryButton={{
          text: isUnblocking ? 'Unblocking...' : 'Unblock',
          onPress: () => {
            if (pendingUnblockUserId !== null) {
              handleUnblock(pendingUnblockUserId);
            }
          },
        }}
        secondaryButton={{
          text: 'Cancel',
          onPress: () => setPendingUnblockUserId(null),
        }}
      />
    </ScrollView>
  );
}
