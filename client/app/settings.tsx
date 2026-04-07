import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeStore, ThemeMode } from '@/store/theme-store';
import { useAuth } from '@/context/auth-context';
import { userService } from '@/services/user-service';
import { CustomAlert } from '@/components/CustomAlert';
import { PaletteOptions } from '@/constants/theme';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Divider } from '@/components/ui/divider';

type SettingItemProps = {
  icon: string;
  label: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
  showDivider?: boolean;
};

function SettingItem({
  icon,
  label,
  onPress,
  rightElement,
  danger = false,
  showDivider = true,
}: SettingItemProps) {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const borderColor = useThemeColor({}, 'border');
  const dangerColor = useThemeColor({}, 'danger');
  const iconColor = danger ? dangerColor : textColor;
  const labelColor = danger ? dangerColor : textColor;

  return (
    <>
      <Pressable className="py-4" onPress={onPress}>
        <HStack className="items-center justify-between">
          <HStack space="md" className="items-center">
            <IconSymbol name={icon as any} size={22} color={iconColor} />
            <Text className="text-base font-medium" style={{ color: labelColor }}>
              {label}
            </Text>
          </HStack>
          {rightElement || <IconSymbol name="chevron.right" size={18} color={subtextColor} />}
        </HStack>
      </Pressable>
      {showDivider ? <Divider style={{ backgroundColor: borderColor }} /> : null}
    </>
  );
}

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');
  const subtextColor = useThemeColor({}, 'subtext');
  const { theme, setTheme, palette, setPalette } = useThemeStore();
  const router = useRouter();

  const [showAccountActionAlert, setShowAccountActionAlert] = useState(false);
  const [showPauseConfirmAlert, setShowPauseConfirmAlert] = useState(false);
  const [showDeleteConfirmAlert, setShowDeleteConfirmAlert] = useState(false);

  const pauseAccountMutation = useMutation({
    mutationFn: () => userService.pauseMyAccount(),
    onSuccess: async () => {
      Toast.show({
        type: 'success',
        text1: 'Account Paused',
        text2: 'Your account is paused. Sign in again anytime to reactivate it.',
      });
      await signOut();
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Pause Failed',
        text2: 'We could not pause your account right now.',
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => userService.deleteMyAccount(),
    onSuccess: async () => {
      Toast.show({
        type: 'success',
        text1: 'Account Deleted',
        text2: 'Your account has been permanently removed.',
      });
      await signOut();
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Delete Failed',
        text2: 'We could not delete your account right now.',
      });
    },
  });

  const accountActionLabel = pauseAccountMutation.isPending
    ? 'Pausing Account...'
    : deleteAccountMutation.isPending
      ? 'Deleting Account...'
      : 'Pause or Delete Account';

  return (
    <ScrollView style={[styles.container, { backgroundColor }]} contentContainerStyle={styles.content}>
      <Box className="mx-4 mt-5 rounded-2xl px-4" style={[styles.cardShadow, { backgroundColor: cardColor }]}>
        <Text className="mt-4 mb-3 text-xs font-semibold uppercase" style={{ color: subtextColor }}>
          Personalization
        </Text>

        <HStack space="sm" className="mb-4 mt-1">
          {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => {
            const active = theme === mode;
            return (
              <Pressable
                key={mode}
                className="flex-1 h-10 rounded-lg items-center justify-center border"
                style={{
                  borderColor: active ? primaryColor : borderColor,
                  backgroundColor: active ? primaryColor : 'transparent',
                }}
                onPress={() => setTheme(mode)}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: active ? '#fff' : textColor }}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </HStack>

        <Text className="mb-2 text-xs font-semibold uppercase" style={{ color: subtextColor }}>
          Color Palette
        </Text>

        <HStack space="sm" className="mb-4 mt-1">
          {PaletteOptions.map((option) => {
            const active = palette === option.id;
            return (
              <Pressable
                key={option.id}
                accessibilityLabel={option.label}
                className="h-12 flex-1 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: active ? cardColor : 'transparent',
                  borderColor: active ? primaryColor : borderColor,
                  borderWidth: 1,
                }}
                onPress={() => setPalette(option.id)}
              >
                <Box
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: option.swatch }}
                />
              </Pressable>
            );
          })}
        </HStack>

        <SettingItem icon="bell.fill" label="Notifications" onPress={() => router.push('/notifications')} />
        <SettingItem
          icon="plus.circle.fill"
          label="Privacy & Security"
          onPress={() => router.push('/settings/privacy')}
        />
        <SettingItem
          icon="hand.raised.fill"
          label="Blocked Users"
          onPress={() => router.push('/settings/blocked-users')}
        />
        <SettingItem
          icon="magnifyingglass"
          label="Help & Support"
          onPress={() => router.push('/settings/support')}
        />
        <SettingItem
          icon="list.bullet"
          label="About My Ride Partner"
          onPress={() => router.push('/settings/about')}
          showDivider={false}
        />
      </Box>

      <Box className="mx-4 mt-5 rounded-2xl px-4" style={[styles.cardShadow, { backgroundColor: cardColor }]}>
        <Text className="mt-4 mb-3 text-xs font-semibold uppercase" style={{ color: subtextColor }}>
          Account
        </Text>
        <SettingItem
          icon="trash.fill"
          label={accountActionLabel}
          onPress={() => setShowAccountActionAlert(true)}
          danger
          showDivider={false}
        />
      </Box>

      <VStack className="items-center px-10 py-10" space="xs">
        <Text className="text-xs" style={{ color: subtextColor }}>
          Version 1.0.0
        </Text>
      </VStack>

      <CustomAlert
        visible={showAccountActionAlert}
        title="Leave your account?"
        message="You can pause your account and come back later, or permanently delete everything now."
        icon="trash.fill"
        onClose={() => setShowAccountActionAlert(false)}
        primaryButton={{
          text: 'Pause Account',
          onPress: () => {
            setShowAccountActionAlert(false);
            setShowPauseConfirmAlert(true);
          },
        }}
        secondaryButton={{
          text: 'Delete Permanently',
          onPress: () => {
            setShowAccountActionAlert(false);
            setShowDeleteConfirmAlert(true);
          },
        }}
        tertiaryButton={{
          text: 'Cancel',
          onPress: () => setShowAccountActionAlert(false),
        }}
      />

      <CustomAlert
        visible={showPauseConfirmAlert}
        title="Pause account?"
        message="Your account will be hidden and you will be signed out. Logging in again will reactivate it."
        icon="person.fill"
        onClose={() => setShowPauseConfirmAlert(false)}
        primaryButton={{
          text: 'Pause',
          onPress: () => {
            setShowPauseConfirmAlert(false);
            pauseAccountMutation.mutate();
          },
        }}
        secondaryButton={{
          text: 'Cancel',
          onPress: () => setShowPauseConfirmAlert(false),
        }}
      />

      <CustomAlert
        visible={showDeleteConfirmAlert}
        title="Delete account permanently?"
        message="This will permanently remove your account and related data. This action cannot be undone."
        icon="trash.fill"
        onClose={() => setShowDeleteConfirmAlert(false)}
        primaryButton={{
          text: 'Delete',
          onPress: () => {
            setShowDeleteConfirmAlert(false);
            deleteAccountMutation.mutate();
          },
        }}
        secondaryButton={{
          text: 'Cancel',
          onPress: () => setShowDeleteConfirmAlert(false),
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
    paddingBottom: 24,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
});
