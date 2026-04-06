import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet, Linking, Platform, TouchableOpacity, Image, Text } from 'react-native';
import * as Location from 'expo-location';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'expo-router';
import { HeaderRight } from '@/components/ui/HeaderRight';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '@/store/user-store';
import FindOutlineIcon from '@/assets/tab-icons/find-outline.svg';
import FindFilledIcon from '@/assets/tab-icons/find-filled.svg';
import ChatsFilledIcon from '@/assets/tab-icons/chats-filled.svg';
import PublishOutlineIcon from '@/assets/tab-icons/publish-outline.svg';
import PublishFilledIcon from '@/assets/tab-icons/publish-filled.svg';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();
  const { profile } = useUserStore();
  const router = useRouter();
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const currentColors = Colors[colorScheme ?? 'light'];

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
  }, [user, isLoading, isFirstLaunch]);

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
      <ThemedView style={styles.permissionContainer}>
        <IconSymbol name="location.slash.fill" size={64} color={Colors[colorScheme ?? 'light'].tint} />
        <ThemedText type="title" style={styles.permissionTitle}>Location Required</ThemedText>
        <ThemedText style={styles.permissionText}>
          My Ride Partner needs access to your location to find nearby rides and help you set pickup locations.
        </ThemedText>
        <ThemedText style={styles.permissionText}>
          Please enable location services in your device settings to continue using the app.
        </ThemedText>

        <View style={styles.buttonContainer}>
          <ThemedText
            style={[styles.buttonText, { color: Colors[colorScheme ?? 'light'].tint }]}
            onPress={() => Linking.openSettings()}
          >
            Open Settings
          </ThemedText>
        </View>

        <View style={styles.buttonContainerSecondary}>
          <ThemedText
            style={styles.buttonTextSecondary}
            onPress={async () => {
              const { status } = await Location.requestForegroundPermissionsAsync();
              setLocationPermission(status);
            }}
          >
            Check Again
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  // Still checking permission
  if (!locationPermission) return null;

  return (
    <Tabs
      screenOptions={() => ({
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        headerShown: true,
        headerStyle: {
          backgroundColor: currentColors.card,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTintColor: currentColors.text,
        tabBarButton: HapticTab,
        headerTitleAlign: 'center',
        headerRight: () => <HeaderRight type="notifications" />,
        headerBackTitleVisible: false,
        headerLeft: () => null,
      })}>
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: 'My Ride Partner',
          title: 'Find',
          tabBarIcon: ({ color, focused }) =>
            focused
              ? <FindFilledIcon width={30} height={30} color={color} />
              : <FindOutlineIcon width={30} height={30} color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/chats')}
              style={styles.headerActionButton}
              activeOpacity={0.7}
            >
              <ChatsFilledIcon width={24} height={24} color={currentColors.text} />
            </TouchableOpacity>
          ),
          tabBarIcon: ({ color }) => (
            <IconSymbol name="list.bullet" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: 'Publish',
          tabBarIcon: ({ color, focused }) =>
            focused
              ? <PublishFilledIcon width={30} height={30} color={color} />
              : <PublishOutlineIcon width={30} height={30} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="person.2.fill" size={28} color={color} />
          ),
        }}
      />


      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerRight: () => <HeaderRight type="settings" />,
          tabBarIcon: ({ focused }) => (
            profileAvatarUrl ? (
              <Image
                source={{ uri: profileAvatarUrl }}
                style={[
                  styles.profileTabAvatar,

                ]}
              />
            ) : (
              <View
                style={[
                  styles.profileTabFallback,
                  {
                    backgroundColor: focused ? currentColors.primary : `${currentColors.border}`,
                  },
                ]}>
                <Text style={styles.profileTabFallbackText}>{profileInitial}</Text>
              </View>
            )
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionTitle: {
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.8,
  },
  buttonContainer: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonContainerSecondary: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonTextSecondary: {
    fontWeight: '600',
    fontSize: 16,
    opacity: 0.6,
  },
  profileTabAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
  },
  headerActionButton: {
    marginRight: 16,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileTabFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileTabFallbackText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
