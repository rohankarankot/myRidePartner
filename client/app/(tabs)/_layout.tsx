import React, { useState } from 'react';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/auth-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '@/store/user-store';
import { useThemeStore } from '@/store/theme-store';
import { getThemeColors } from '@/constants/theme';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { NotificationPermissionGate } from '@/components/notification-permission-gate';

import { TabsShell } from './tabs-shell';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const palette = useThemeStore((state) => state.palette);
  const { user, isLoading } = useAuth();
  const { profile } = useUserStore();
  const router = useRouter();
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [notificationReady, setNotificationReady] = useState(false);
  const mode = colorScheme === 'dark' ? 'dark' : 'light';
  const currentColors = getThemeColors(palette)[mode];
  const tabBarBaseHeight = 60;
  const tabBarBottomPadding = Math.max(insets.bottom, 8);
  const tabBarHeight = tabBarBaseHeight + tabBarBottomPadding;

  const profileAvatarUrl = typeof profile?.avatar === 'string' ? profile.avatar : profile?.avatar?.url;
  const profileInitial = (profile?.fullName || user?.username || 'U').charAt(0).toUpperCase();

  React.useEffect(() => {
    AsyncStorage.getItem('hasSeenOnboarding').then((value) => {
      setIsFirstLaunch(value !== 'true');
    });
  }, []);

  React.useEffect(() => {
    if (isFirstLaunch === null || isLoading) return;

    if (isFirstLaunch) {
      router.replace('/onboarding');
    } else if (!user) {
      router.replace('/login');
    }
  }, [user, isLoading, isFirstLaunch, router]);

  const showContent = !isLoading && user && isFirstLaunch === false;

  React.useEffect(() => {
    if (!showContent) return;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
      }
    })();
  }, [showContent]);

  if (!showContent) return null;

  if (locationPermission && locationPermission !== 'granted') {
    return (
      <Box className="flex-1 justify-center items-center px-10" style={{ backgroundColor: currentColors.background }}>
        <Box className="w-20 h-20 rounded-[32px] bg-gray-50 items-center justify-center rotate-3 shadow-xl mb-8">
          <IconSymbol name="location.slash.fill" size={34} color={currentColors.tint} />
        </Box>
        <VStack className="items-center" space="xs">
          <Text className="text-2xl font-extrabold text-center uppercase tracking-widest" style={{ color: currentColors.text }}>
            Navigation Locked
          </Text>
          <Text className="text-sm font-medium leading-6 text-center" style={{ color: currentColors.subtext }}>
            Cab Collab needs your location to find nearby rides and set your pickup points safely.
          </Text>
        </VStack>
      </Box>
    );
  }

  if (!locationPermission) return null;

  if (!notificationReady) {
    return (
      <NotificationPermissionGate
        title="Notifications Locked"
        description="Cab Collab needs notification permissions to alert you when a ride is joined, updated, or when you receive chat messages."
        onGranted={() => setNotificationReady(true)}
        onDenied={() => undefined}
      />
    );
  }

  return (
    <TabsShell
      currentColors={currentColors}
      tabBarHeight={tabBarHeight}
      tabBarBottomPadding={tabBarBottomPadding}
      profileAvatarUrl={profileAvatarUrl}
      profileInitial={profileInitial}
    />
  );
}
