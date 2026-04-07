import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
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
    <ScrollView style={[styles.container, { backgroundColor }]} contentContainerStyle={styles.content}>
      <Box className="rounded-3xl p-5" style={{ backgroundColor: cardColor }}>
        <Text className="text-xl font-bold mb-4" style={{ color: textColor }}>
          Blocked Users
        </Text>

        {isLoading ? (
          <Box className="min-h-[180px] items-center justify-center">
            <Spinner color={primaryColor} />
          </Box>
        ) : blockedUsers.length === 0 ? (
          <Box className="min-h-[180px] items-center justify-center px-6">
            <IconSymbol name="checkmark.shield.fill" size={28} color={primaryColor} />
            <Text className="text-lg font-bold mt-3" style={{ color: textColor }}>
              No blocked users
            </Text>
            <Text className="text-sm text-center mt-2 leading-5" style={{ color: subtextColor }}>
              People you block will appear here so you can review or unblock them later.
            </Text>
          </Box>
        ) : (
          <Box className="rounded-3xl overflow-hidden border" style={{ borderColor }}>
            {blockedUsers.map(({ userId, profile, isProfileLoading }, index) => {
              const avatarUri =
                typeof profile?.avatar === 'string' ? profile.avatar : profile?.avatar?.url;
              const displayName = profile?.fullName || `User #${userId}`;
              const subtitle = profile?.city || 'Blocked account';

              return (
                <React.Fragment key={userId}>
                  <HStack className="items-center justify-between p-4" space="md">
                    <HStack className="items-center flex-1" space="md">
                      <Avatar size="md">
                        <AvatarFallbackText>{displayName}</AvatarFallbackText>
                        {avatarUri ? <AvatarImage source={{ uri: avatarUri }} alt={displayName} /> : null}
                      </Avatar>

                      <VStack className="flex-1" space="xs">
                        <Text className="text-base font-semibold" style={{ color: textColor }} numberOfLines={1}>
                          {displayName}
                        </Text>
                        <Text className="text-sm" style={{ color: subtextColor }} numberOfLines={1}>
                          {isProfileLoading ? 'Loading profile...' : subtitle}
                        </Text>
                      </VStack>
                    </HStack>

                    <Pressable
                      className="rounded-full px-4 py-2 border"
                      style={{ borderColor, backgroundColor: `${primaryColor}10` }}
                      onPress={() => setPendingUnblockUserId(userId)}
                      disabled={isUnblocking}
                    >
                      <Text className="text-sm font-bold" style={{ color: primaryColor }}>
                        Unblock
                      </Text>
                    </Pressable>
                  </HStack>
                  {index < blockedUsers.length - 1 ? <Divider style={{ backgroundColor: borderColor }} /> : null}
                </React.Fragment>
              );
            })}
          </Box>
        )}
      </Box>

      <CustomAlert
        visible={pendingUnblockUserId !== null}
        title="Unblock user?"
        message={`${pendingDisplayName} will be able to appear in discovery and interact with you again where blocking is enforced.`}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
});
