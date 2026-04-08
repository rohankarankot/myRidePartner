import { Tabs, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Linking, TouchableOpacity, Image, Platform } from 'react-native';
import * as Location from 'expo-location';
import { ThemedText } from '@/components/themed-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { useAuth } from '@/context/auth-context';
import { HeaderRight } from '@/components/ui/HeaderRight';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '@/store/user-store';
import { useThemeStore } from '@/store/theme-store';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { Pressable } from '@/components/ui/pressable';

import FindFilledIcon from '@/assets/tab-icons/find-filled.svg';
import PublishOutlineIcon from '@/assets/tab-icons/publish-outline.svg';
import PublishFilledIcon from '@/assets/tab-icons/publish-filled.svg';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const palette = useThemeStore((state) => state.palette);
  const { user, isLoading } = useAuth();
  const { profile } = useUserStore();
  const router = useRouter();
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const currentColors = getThemeColors(palette)[colorScheme ?? 'light'];
  const tabBarBaseHeight = Platform.OS === 'ios' ? 60 : 58;
  const tabBarBottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 10);
  const tabBarHeight = tabBarBaseHeight + tabBarBottomPadding;

  const profileAvatarUrl =
    typeof profile?.avatar === 'string'
      ? profile.avatar
      : profile?.avatar?.url;
  const profileInitial = (profile?.fullName || user?.username || 'U').charAt(0).toUpperCase();

  React.useEffect(() => {
    AsyncStorage.getItem('hasSeenOnboarding').then(value => {
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
    if (showContent) {
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status);
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
        }
      })();
    }
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
                My Ride Partner needs your location to find nearby rides and set your pickup points safely.
            </Text>
        </VStack>

        <VStack className="w-full mt-10" space="md">
            <Button 
                className="h-14 rounded-2xl shadow-lg"
                style={{ backgroundColor: currentColors.tint }}
                onPress={() => Linking.openSettings()}
            >
                <ButtonText className="text-xs font-extrabold uppercase tracking-widest">Open Settings</ButtonText>
            </Button>
            <Button 
                variant="outline"
                className="h-14 rounded-2xl border-2"
                style={{ borderColor: currentColors.border }}
                onPress={async () => {
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    setLocationPermission(status);
                }}
            >
                <ButtonText className="text-xs font-extrabold uppercase tracking-widest" style={{ color: currentColors.subtext }}>Check Again</ButtonText>
            </Button>
        </VStack>
      </Box>
    );
  }

  // Still checking permission
  if (!locationPermission) return null;

  return (
    <Tabs
      screenOptions={() => ({
        tabBarActiveTintColor: currentColors.tint,
        tabBarInactiveTintColor: currentColors.subtext,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        headerShown: true,
        headerStyle: {
          backgroundColor: currentColors.card,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: currentColors.border,
        },
        headerTitleStyle: {
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          fontSize: 16,
          fontFamily: 'Plus Jakarta Sans',
        },
        headerTintColor: currentColors.text,
        tabBarButton: HapticTab,
        headerTitleAlign: 'center',
        headerRight: () => <HeaderRight type="notifications" />,
        headerBackTitleVisible: false,
        headerLeft: () => null,
        tabBarStyle: {
            backgroundColor: currentColors.card,
            borderTopWidth: 1,
            borderTopColor: currentColors.border,
            height: tabBarHeight,
            paddingTop: 10,
            paddingBottom: tabBarBottomPadding,
        }
      })}>
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: 'FIND RIDES',
          title: 'Find',
          tabBarIcon: ({ color, focused }) =>
            focused
              ? <FindFilledIcon width={28} height={28} color={color} />
              : <IconSymbol name="magnifyingglass" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          headerTitle: 'ACTIVITY',
          title: 'Activity',
          headerRight: () => <HeaderRight type="chats" />,
          tabBarIcon: ({ color }) => (
            <IconSymbol name="list.bullet" size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          headerTitle: 'PUBLISH',
          title: 'Publish',
          tabBarIcon: ({ color, focused }) =>
            focused
              ? <PublishFilledIcon width={28} height={28} color={color} />
              : <PublishOutlineIcon width={28} height={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          headerTitle: 'COMMUNITY',
          title: 'Community',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="person.2.fill" size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          headerTitle: 'PROFILE',
          title: 'Profile',
          headerRight: () => <HeaderRight type="settings" />,
          tabBarIcon: ({ focused, color }) => (
            profileAvatarUrl ? (
                <Box 
                    className="w-8 h-8 rounded-full border-2 overflow-hidden shadow-sm"
                    style={{ borderColor: focused ? currentColors.tint : `${currentColors.border}` }}
                >
                    <Image
                        source={{ uri: profileAvatarUrl }}
                        className="w-full h-full"
                    />
                </Box>
            ) : (
              <Box
                className="w-8 h-8 rounded-full items-center justify-center border shadow-sm"
                style={{
                    backgroundColor: focused ? currentColors.tint : currentColors.background,
                    borderColor: focused ? currentColors.tint : `${currentColors.border}`,
                }}>
                <Text 
                    className="text-[10px] font-extrabold uppercase"
                    style={{ color: focused ? '#fff' : color }}
                >
                    {profileInitial}
                </Text>
              </Box>
            )
          ),
        }}
      />
    </Tabs>
  );
}
