import React from 'react';
import { ScrollView } from 'react-native';
import { Stack } from 'expo-router';

import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Divider } from '@/components/ui/divider';

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
    <ScrollView style={{ flex: 1, backgroundColor }} contentContainerStyle={{ paddingBottom: 40 }}>
      <Stack.Screen options={{ title: 'Notifications', headerTitleStyle: { fontWeight: '800' } }} />

      <VStack className="px-6 py-8" space="xs">
          <Text className="text-3xl font-extrabold" style={{ color: textColor }}>Notifications</Text>
          <Text className="text-sm font-medium" style={{ color: subtextColor }}>Configure how you want to be notified about app activity.</Text>
      </VStack>

      <Box className="mx-6 rounded-[32px] p-6 mb-6 shadow-sm border" style={{ backgroundColor: cardColor, borderColor }}>
        <Text className="text-lg font-bold mb-3" style={{ color: textColor }}>
          Notification Preferences
        </Text>
        <Text className="text-sm font-medium leading-6" style={{ color: subtextColor }}>
          Configure how My Ride Partner should reach you. More granular push and email
          controls will be available here soon.
        </Text>
      </Box>

      <VStack space="md" className="px-6">
        {PREFERENCES.map((item) => (
          <Box
            key={item.title}
            className="rounded-[28px] p-5 shadow-sm border"
            style={{ backgroundColor: cardColor, borderColor }}
          >
            <HStack space="md" className="items-start">
              <Box
                className="h-10 w-10 rounded-full items-center justify-center shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                <IconSymbol name={item.icon as any} size={18} color="#fff" />
              </Box>
              <VStack className="flex-1" space="xs">
                <Text className="text-base font-bold" style={{ color: textColor }}>
                  {item.title}
                </Text>
                <Text className="text-sm font-medium leading-5" style={{ color: subtextColor }}>
                  {item.description}
                </Text>
              </VStack>
            </HStack>
          </Box>
        ))}
      </VStack>

      <VStack className="items-center py-12" space="xs">
          <Divider className="w-12 mb-4" style={{ backgroundColor: borderColor }} />
        <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
          Push notifications are enabled by default
        </Text>
      </VStack>
    </ScrollView>
  );
}
