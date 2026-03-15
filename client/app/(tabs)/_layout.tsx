import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet, Linking, Platform, TouchableOpacity } from 'react-native';
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

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

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
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].card,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTintColor: Colors[colorScheme ?? 'light'].text,
        tabBarButton: HapticTab,
        headerTitleAlign: 'center',
        tabBarShowLabel: false,
        headerRight: () => <HeaderRight type="notifications" />,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: 'My Ride Partner',
          title: 'Find',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Publish',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerRight: () => <HeaderRight type="settings" />,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
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
});
