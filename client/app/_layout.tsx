import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { HeaderRight } from '@/components/ui/HeaderRight';
import { AppProviders } from '@/providers/app-providers';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack
        screenOptions={{
          headerTitleAlign: 'center',
          headerRight: () => <HeaderRight type="notifications" />,
        }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: 'Settings', headerBackTitle: 'Back' }} />
        <Stack.Screen name="settings/blocked-users" options={{ title: 'Blocked Users', headerBackTitle: 'Settings' }} />
        <Stack.Screen name="terms" options={{ title: 'Terms & Privacy', headerBackTitle: 'Back', headerShown: true }} />
        <Stack.Screen name="trip-chat/[tripId]" options={{ title: 'Ride Chat', headerBackTitle: 'Trip' }} />
        <Stack.Screen name="trip-chat-members/[tripId]" options={{ title: 'Ride Members', headerBackTitle: 'Chat' }} />
        <Stack.Screen name="requests/index" options={{ title: 'Join Requests', headerBackTitle: 'Back' }} />
        <Stack.Screen name="requests/[documentId]" options={{ title: 'Request Details', headerBackTitle: 'Back' }} />
        <Stack.Screen name="ratings" options={{ title: 'My Ratings', headerBackTitle: 'Profile' }} />
      </Stack>
    </AppProviders>
  );
}
