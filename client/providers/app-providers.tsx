import { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { queryClient } from '@/shared/lib/query-client';
import { AuthProvider } from '@/features/auth/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PushNotificationHandler } from '@/components/push-notification-handler';
import { SocketHandler } from '@/components/socket-handler';

export function AppProviders({ children }: PropsWithChildren) {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <KeyboardProvider>
            <PushNotificationHandler />
            <SocketHandler />
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <BottomSheetModalProvider>
                {children}
                <StatusBar style="auto" />
                <Toast position="bottom" bottomOffset={80} />
              </BottomSheetModalProvider>
            </ThemeProvider>
          </KeyboardProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
