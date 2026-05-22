import React, { useEffect, useState } from 'react';
import { Linking, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeStore } from '@/store/theme-store';
import { getThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CustomAlert } from '@/components/CustomAlert';
import { useUserStore } from '@/store/user-store';

type NotificationPermissionGateProps = {
  title: string;
  description: string;
  onGranted?: () => void | Promise<void>;
  onDenied?: () => void;
  showOpenSettings?: boolean;
};

export function NotificationPermissionGate({
  title,
  description,
  onGranted,
  onDenied,
  showOpenSettings = true,
}: NotificationPermissionGateProps) {
  const palette = useThemeStore((state) => state.palette);
  const colorScheme = useColorScheme();
  const mode = colorScheme === 'dark' ? 'dark' : 'light';
  const currentColors = getThemeColors(palette)[mode];
  const profile = useUserStore((state) => state.profile);
  const [checking, setChecking] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [showSettingsAlert, setShowSettingsAlert] = useState(false);

  useEffect(() => {
    void checkPermission();
  }, []);

  const checkPermission = async () => {
    setChecking(true);
    setStatusText('Checking notification permission...');
    try {
      const { status } = await Notifications.getPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      if (granted) {
        setStatusText('Notification permission allowed.');
        await onGranted?.();
      } else {
        setStatusText('Notification permission is required.');
        onDenied?.();
      }
    } finally {
      setChecking(false);
    }
  };

  const requestPermission = async () => {
    setChecking(true);
    setStatusText('Requesting notification permission...');
    try {
      const { status, canAskAgain } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      if (granted) {
        setStatusText('Notification permission allowed.');
        await onGranted?.();
      } else {
        setStatusText('Notification permission is required.');
        if (!canAskAgain) {
          setShowSettingsAlert(true);
        }
        onDenied?.();
      }
    } finally {
      setChecking(false);
    }
  };

  if (hasPermission === true) {
    return null;
  }

  return (
    <Box className="flex-1 justify-center items-center px-10" style={{ backgroundColor: currentColors.background }}>
      <CustomAlert
        visible={showSettingsAlert}
        title="Notifications Disabled"
        message="Your device will not show the permission prompt again. Please open Settings and allow notifications for My Ride Partner."
        icon="bell.slash.fill"
        primaryButton={{
          text: 'Open Settings',
          onPress: () => {
            setShowSettingsAlert(false);
            Linking.openSettings();
          },
        }}
        secondaryButton={{
          text: 'Cancel',
          onPress: () => setShowSettingsAlert(false),
        }}
        onClose={() => setShowSettingsAlert(false)}
      />
      <Box className="w-20 h-20 rounded-[32px] bg-gray-50 items-center justify-center rotate-3 shadow-xl mb-8">
        <IconSymbol name="bell.slash.fill" size={34} color={currentColors.tint} />
      </Box>
      <VStack className="items-center" space="xs">
        <Text className="text-2xl font-extrabold text-center uppercase tracking-widest" style={{ color: currentColors.text }}>
          {title}
        </Text>
        <Text className="text-sm font-medium leading-6 text-center" style={{ color: currentColors.subtext }}>
          {description}
        </Text>
        {statusText ? (
          <Text className="text-xs font-semibold text-center uppercase tracking-widest mt-2" style={{ color: currentColors.tint }}>
            {statusText}
          </Text>
        ) : null}
      </VStack>

      <VStack className="w-full mt-10" space="md">
        {showOpenSettings ? (
          <Button
            className="h-14 rounded-2xl shadow-lg"
            style={{ backgroundColor: currentColors.tint }}
            onPress={() => Linking.openSettings()}
            disabled={checking}
          >
            <ButtonText className="text-xs font-extrabold uppercase tracking-widest">Open Settings</ButtonText>
          </Button>
        ) : null}
        <Button
          variant="outline"
          className="h-14 rounded-2xl border-2"
          style={{ borderColor: currentColors.border }}
          onPress={requestPermission}
          disabled={checking}
        >
          <ButtonText className="text-xs font-extrabold uppercase tracking-widest" style={{ color: currentColors.subtext }}>
            {checking ? 'Checking...' : Platform.OS === 'ios' ? 'Allow Notifications' : 'Check Again'}
          </ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}
