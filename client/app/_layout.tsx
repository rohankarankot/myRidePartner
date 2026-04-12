import '@/global.css';
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
        <Stack.Screen name="settings/community" options={{ title: 'Community Settings', headerBackTitle: 'Settings' }} />
        <Stack.Screen name="settings/blocked-users" options={{ title: 'Blocked Users', headerBackTitle: 'Settings' }} />
        <Stack.Screen name="profile-analytics" options={{ title: 'Your Analytics', headerBackTitle: 'Profile' }} />
        <Stack.Screen name="my-activity" options={{ title: 'My Activity', headerBackTitle: 'Profile' }} />
        <Stack.Screen name="terms" options={{ title: 'Terms & Privacy', headerBackTitle: 'Back', headerShown: true }} />
        <Stack.Screen name="chats" options={{ title: 'Chats', headerBackTitle: 'Activity' }} />
        <Stack.Screen name="trip-chat/[tripId]" options={{ title: 'Ride Chat', headerBackTitle: 'Trip', headerShown: false }} />
        <Stack.Screen name="trip-chat-members/[tripId]" options={{ title: 'Ride Members', headerBackTitle: 'Chat' }} />
        <Stack.Screen name="community-info" options={{ title: 'Community Info', headerBackTitle: 'Community' }} />
        <Stack.Screen name="community-chat" options={{ title: 'Community Chat', headerBackTitle: 'Community' }} />
        <Stack.Screen name="community-members" options={{ title: 'Members', headerBackTitle: 'Info' }} />
        <Stack.Screen name="requests/index" options={{ title: 'Join Requests', headerBackTitle: 'Back' }} />
        <Stack.Screen name="requests/[documentId]" options={{ title: 'Request Details', headerBackTitle: 'Back' }} />
        <Stack.Screen name="ratings" options={{ title: 'My Ratings', headerBackTitle: 'Profile' }} />
        <Stack.Screen name="create-community-group" options={{ title: 'Create Group', headerBackTitle: 'Back' }} />
        <Stack.Screen name="my-community-groups" options={{ title: 'My Groups', headerBackTitle: 'Back' }} />
        <Stack.Screen name="community-group/[documentId]" options={{ title: 'Group', headerBackTitle: 'Back' }} />
      </Stack>
    </AppProviders>
  );
}
