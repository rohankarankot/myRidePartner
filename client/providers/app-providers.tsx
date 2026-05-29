import { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';
import { BaseToast, ErrorToast } from 'react-native-toast-message';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { queryClient } from '@/shared/lib/query-client';
import { AuthProvider } from '@/features/auth/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { AnalyticsHandler } from '@/components/analytics-handler';
import { PushNotificationHandler } from '@/components/push-notification-handler';
import { SocketHandler } from '@/components/socket-handler';
import { useThemeStore } from '@/store/theme-store';
import { useThemeColor } from '@/hooks/use-theme-color';

export function AppProviders({ children }: PropsWithChildren) {
  const colorScheme = useColorScheme();
  const themeMode = useThemeStore((state) => state.theme);
  const palette = useThemeStore((state) => state.palette);
  const toastBackground = useThemeColor({}, 'card');
  const toastText = useThemeColor({}, 'text');
  const toastSubtext = useThemeColor({}, 'subtext');
  const toastBorder = useThemeColor({}, 'border');
  const toastSuccess = useThemeColor({}, 'success');
  const toastDanger = useThemeColor({}, 'danger');
  const toastSuccessBg = useThemeColor({}, 'successBg');
  const toastDangerBg = useThemeColor({}, 'dangerBg');

  const toastConfig = {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{
          backgroundColor: toastBackground,
          borderLeftColor: toastSuccess,
          borderColor: toastBorder,
          borderWidth: 1,
        }}
        contentContainerStyle={{ paddingHorizontal: 14 }}
        text1Style={{
          color: toastText,
          fontSize: 14,
          fontWeight: '800',
        }}
        text2Style={{
          color: toastSubtext,
          fontSize: 12,
          fontWeight: '600',
        }}
      />
    ),
    error: (props: any) => (
      <ErrorToast
        {...props}
        style={{
          backgroundColor: toastBackground,
          borderLeftColor: toastDanger,
          borderColor: toastBorder,
          borderWidth: 1,
        }}
        contentContainerStyle={{ paddingHorizontal: 14 }}
        text1Style={{
          color: toastText,
          fontSize: 14,
          fontWeight: '800',
        }}
        text2Style={{
          color: toastSubtext,
          fontSize: 12,
          fontWeight: '600',
        }}
      />
    ),
    info: (props: any) => (
      <BaseToast
        {...props}
        style={{
          backgroundColor: toastBackground,
          borderLeftColor: toastSuccessBg,
          borderColor: toastBorder,
          borderWidth: 1,
        }}
        contentContainerStyle={{ paddingHorizontal: 14 }}
        text1Style={{
          color: toastText,
          fontSize: 14,
          fontWeight: '800',
        }}
        text2Style={{
          color: toastSubtext,
          fontSize: 12,
          fontWeight: '600',
        }}
      />
    ),
  };

  return (
    <GluestackUIProvider mode={themeMode} palette={palette}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <KeyboardProvider>
              <AnalyticsHandler />
              <PushNotificationHandler />
              <SocketHandler />
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <BottomSheetModalProvider>
                  {children}
                  <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                  <Toast position="bottom" bottomOffset={80} config={toastConfig} />
                </BottomSheetModalProvider>
              </ThemeProvider>
            </KeyboardProvider>
          </AuthProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </GluestackUIProvider>
  );
}
