import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useQueries } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import { userService } from '@/features/auth/api/user-service';
import { useBlockedUsers } from '@/features/safety/hooks/use-blocked-users';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CustomAlert } from '@/components/CustomAlert';

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
      <View style={[styles.heroCard, { backgroundColor: cardColor, borderColor }]}>

        <Text style={[styles.heroTitle, { color: textColor }]}>Blocked Users</Text>

        {isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={primaryColor} />
          </View>
        ) : blockedUsers.length === 0 ? (
          <View style={[styles.stateCard, { backgroundColor: cardColor, borderColor }]}>
            <IconSymbol name="checkmark.shield.fill" size={28} color={primaryColor} />
            <Text style={[styles.emptyTitle, { color: textColor }]}>No blocked users</Text>
            <Text style={[styles.emptyCopy, { color: subtextColor }]}>
              People you block will appear here so you can review or unblock them later.
            </Text>
          </View>
        ) : (
          <View style={[styles.listCard, { backgroundColor: cardColor, borderColor }]}>
            {blockedUsers.map(({ userId, profile, isProfileLoading }, index) => {
              const avatarUri =
                typeof profile?.avatar === 'string' ? profile.avatar : profile?.avatar?.url;
              const displayName = profile?.fullName || `User #${userId}`;
              const subtitle = profile?.city || 'Blocked account';

              return (
                <View
                  key={userId}
                  style={[
                    styles.row,
                    index < blockedUsers.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor },
                  ]}
                >
                  <View style={styles.userMeta}>
                    {avatarUri ? (
                      <Image source={{ uri: avatarUri }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatarFallback, { backgroundColor: `${primaryColor}16` }]}>
                        <IconSymbol name="person.fill" size={18} color={primaryColor} />
                      </View>
                    )}
                    <View style={styles.userCopy}>
                      <Text style={[styles.userName, { color: textColor }]} numberOfLines={1}>
                        {displayName}
                      </Text>
                      <Text style={[styles.userSubtitle, { color: subtextColor }]} numberOfLines={1}>
                        {isProfileLoading ? 'Loading profile...' : subtitle}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.unblockButton, { borderColor, backgroundColor: `${primaryColor}10` }]}
                    onPress={() => setPendingUnblockUserId(userId)}
                    disabled={isUnblocking}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.unblockButtonText, { color: primaryColor }]}>Unblock</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </View>
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
    gap: 16,
  },
  heroCard: {
    borderRadius: 20,
    padding: 18,
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  heroCopy: {
    fontSize: 14,
    lineHeight: 20,
  },
  stateCard: {
    minHeight: 180,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  emptyCopy: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
  listCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCopy: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  unblockButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  unblockButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
