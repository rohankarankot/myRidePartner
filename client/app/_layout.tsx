import React from 'react';
import { Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import 'react-native-reanimated';
import { HeaderRight } from '@/components/ui/HeaderRight';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppProviders } from '@/providers/app-providers';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack
        screenOptions={({ navigation }) => ({
          headerTitleAlign: 'center',
          headerRight: () => <HeaderRight type="notifications" />,
          headerBackTitleVisible: false,
          headerLeft: ({ tintColor, canGoBack }) =>
            canGoBack || navigation.canGoBack() ? (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
              >
                <IconSymbol name="chevron.left" size={22} color={(tintColor as string) || '#111827'} />
              </TouchableOpacity>
            ) : null,
        })}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: 'Settings', headerBackTitle: 'Back' }} />
        <Stack.Screen name="settings/blocked-users" options={{ title: 'Blocked Users', headerBackTitle: 'Settings' }} />
        <Stack.Screen name="profile-analytics" options={{ title: 'Your Analytics', headerBackTitle: 'Profile' }} />
        <Stack.Screen name="terms" options={{ title: 'Terms & Privacy', headerBackTitle: 'Back', headerShown: true }} />
        <Stack.Screen name="trip-chat/[tripId]" options={{ title: 'Ride Chat', headerBackTitle: 'Trip', headerShown: false }} />
        <Stack.Screen name="trip-chat-members/[tripId]" options={{ title: 'Ride Members', headerBackTitle: 'Chat' }} />
        <Stack.Screen name="requests/index" options={{ title: 'Join Requests', headerBackTitle: 'Back' }} />
        <Stack.Screen name="requests/[documentId]" options={{ title: 'Request Details', headerBackTitle: 'Back' }} />
        <Stack.Screen name="ratings" options={{ title: 'My Ratings', headerBackTitle: 'Profile' }} />
      </Stack>
    </AppProviders>
  );
}
