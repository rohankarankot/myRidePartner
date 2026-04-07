import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

const PREFERENCES = [
  {
    title: 'Trip activity',
    description: 'Get alerts for ride requests, approvals, cancellations, and trip updates.',
    icon: 'bell.fill',
  },
  {
    title: 'Messages',
    description: 'Stay informed when someone sends you a new chat or community message.',
    icon: 'message.fill',
  },
  {
    title: 'Safety and account',
    description: 'Important notifications for verification, reports, and account status changes.',
    icon: 'checkmark.shield.fill',
  },
];

export default function NotificationSettingsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  return (
    <ScrollView style={[styles.container, { backgroundColor }]} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Notifications' }} />

      <Box className="rounded-2xl p-5 mb-4" style={{ backgroundColor: cardColor }}>
        <Text className="text-lg font-bold mb-2" style={{ color: textColor }}>
          Notification Preferences
        </Text>
        <Text className="text-sm leading-6" style={{ color: subtextColor }}>
          Configure how My Ride Partner should reach you. More granular push and email
          controls will be available here soon.
        </Text>
      </Box>

      <VStack space="md">
        {PREFERENCES.map((item) => (
          <Box
            key={item.title}
            className="rounded-2xl p-4 border"
            style={{ backgroundColor: cardColor, borderColor }}
          >
            <HStack space="md" className="items-start">
              <Box
                className="h-10 w-10 rounded-full items-center justify-center"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <IconSymbol name={item.icon as any} size={18} color={primaryColor} />
              </Box>
              <VStack className="flex-1" space="xs">
                <Text className="text-base font-semibold" style={{ color: textColor }}>
                  {item.title}
                </Text>
                <Text className="text-sm leading-5" style={{ color: subtextColor }}>
                  {item.description}
                </Text>
              </VStack>
            </HStack>
          </Box>
        ))}
      </VStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
});
