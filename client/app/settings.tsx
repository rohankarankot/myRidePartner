import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import Constants from 'expo-constants';

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
    <VStack >
      <Pressable className="py-4 px-2" onPress={onPress}>
        <HStack className="items-center justify-between">
          <HStack space="md" className="items-center">
            <Box className="w-8 h-8 items-center justify-center rounded-full" style={{ backgroundColor: `${iconColor}10` }}>
              <IconSymbol name={icon as any} size={18} color={iconColor} />
            </Box>
            <Text className="text-base font-bold" style={{ color: labelColor }}>
              {label}
            </Text>
          </HStack>
          {rightElement || <IconSymbol name="chevron.right" size={16} color={subtextColor} />}
        </HStack>
      </Pressable>
      {showDivider ? <Divider style={{ backgroundColor: borderColor }} className="mx-2" /> : null}
    </VStack>
  );
}

export default function SettingsScreen() {
  const appVersion = Constants.expoConfig?.version ?? '2.0.0';
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
    <ScrollView style={{ flex: 1, backgroundColor }} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Visual Header */}
      <VStack className="px-6 py-8" space="xs">
        <Text className="text-3xl font-extrabold" style={{ color: textColor }}>Settings</Text>
        <Text className="text-sm font-medium" style={{ color: subtextColor }}>Customize your experience and manage your account.</Text>
      </VStack>

      <Box className="mx-6 rounded-[32px] p-4 border" style={{ backgroundColor: cardColor, borderColor }}>
        <Text className="mx-2 mb-3 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
          Appearance
        </Text>

        <HStack space="xs" className="mb-6 mx-2">
          {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => {
            const active = theme === mode;
            return (
              <Pressable
                key={mode}
                className="flex-1 h-12 rounded-2xl items-center justify-center border"
                style={{
                  borderColor: active ? primaryColor : borderColor,
                  backgroundColor: active ? primaryColor : `${subtextColor}05`,
                }}
                onPress={() => setTheme(mode)}
              >
                <Text
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: active ? '#fff' : textColor }}
                >
                  {mode}
                </Text>
              </Pressable>
            );
          })}
        </HStack>

        <Text className="mx-2 mb-3 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
          Theme Palette
        </Text>

        <HStack space="xs" className="mb-6 mx-2">
          {PaletteOptions.map((option) => {
            const active = palette === option.id;
            return (
              <Pressable
                key={option.id}
                accessibilityLabel={option.label}
                className="h-14 flex-1 items-center justify-center rounded-2xl border"
                style={{
                  backgroundColor: active ? `${option.swatch}15` : `${subtextColor}05`,
                  borderColor: active ? option.swatch : borderColor,
                }}
                onPress={() => setPalette(option.id)}
              >
                <Box
                  className="h-5 w-5 rounded-full border shadow-inner"
                  style={{ backgroundColor: option.swatch, borderColor: 'white' }}
                />
              </Pressable>
            );
          })}
        </HStack>

        <SettingItem icon="bell.fill" label="Notifications" onPress={() => router.push('/notifications')} />
        <SettingItem
          icon="shield.fill"
          label="Privacy & Security"
          onPress={() => router.push('/settings/privacy')}
        />
        <SettingItem
          icon="hand.raised.fill"
          label="Blocked Users"
          onPress={() => router.push('/settings/blocked-users')}
        />
        <SettingItem
          icon="questionmark.circle.fill"
          label="Help & Support"
          onPress={() => router.push('/settings/support')}
        />
        <SettingItem
          icon="info.circle.fill"
          label="About My Ride Partner"
          onPress={() => router.push('/settings/about')}
          showDivider={false}
        />
      </Box>

      <Box className="mx-6 mt-6 rounded-[32px] p-4 border" style={{ backgroundColor: cardColor, borderColor }}>
        <Text className="mx-2 mb-3 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
          Account Management
        </Text>
        <SettingItem
          icon="trash.fill"
          label={accountActionLabel}
          onPress={() => setShowAccountActionAlert(true)}
          danger
          showDivider={false}
        />
      </Box>

      <VStack className="items-center py-10" space="xs">
        <Divider className="w-12 mb-4" style={{ backgroundColor: borderColor }} />
        <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
          Version {appVersion}
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
