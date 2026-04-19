import React from 'react';
import { ScrollView } from 'react-native';
import { Stack } from 'expo-router';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Divider } from '@/components/ui/divider';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body:
      'We collect information you provide directly to us, such as your name, email, phone number, and profile picture. As a carpooling app, we also collect trip-related details and location data to match you with rides and track trips securely.',
  },
  {
    title: '2. How We Use Your Information',
    body:
      'Your information is used to facilitate carpooling, ensure user safety, communicate ride updates, and improve our services. Location data is shared with other users only when you actively participate in a trip.',
  },
  {
    title: '3. Data Sharing and Security',
    body:
      'We do not sell your personal data. Your profile information such as name, avatar, and ratings is visible to other users to build trust and safety in the community. We implement standard security measures to protect your data from unauthorized access.',
  },
  {
    title: '4. Your Rights',
    body:
      "You have the right to access, update, or delete your account information at any time through the app's account settings. You can also withdraw consent for location tracking via your device settings, though this may limit app functionality.",
  },
  {
    title: '5. Contact Us',
    body:
      'If you have questions regarding this Privacy Policy, please contact us at rohan.alwayscodes@gmail.com.',
  },
];

export default function PrivacySettingsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  return (
    <ScrollView style={{ flex: 1, backgroundColor }} contentContainerStyle={{ paddingBottom: 40 }}>
      <Stack.Screen options={{ title: 'Privacy & Policy', headerTitleStyle: { fontWeight: '800' } }} />

      <VStack className="px-6 py-8" space="xs">
        <Text className="text-3xl font-extrabold" style={{ color: textColor }}>Privacy Policy</Text>
        <Text className="text-sm font-medium" style={{ color: subtextColor }}>How we handle your data and protect your privacy.</Text>
      </VStack>

      <Box className="mx-6 rounded-[32px] p-6 mb-6 shadow-sm border" style={{ backgroundColor: cardColor, borderColor }}>
        <VStack space="xl">
          {SECTIONS.map((section, index) => (
            <VStack key={section.title} space="sm">
              <Text className="text-lg font-bold" style={{ color: textColor }}>
                {section.title}
              </Text>
              <Text className="text-sm font-medium leading-7" style={{ color: subtextColor }}>
                {section.body}
              </Text>
              {index < SECTIONS.length - 1 && <Divider className="mt-4" style={{ backgroundColor: borderColor }} />}
            </VStack>
          ))}
        </VStack>
      </Box>

      <VStack className="items-center py-6" space="xs">
        <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
          Last Updated: March 2026
        </Text>
      </VStack>
    </ScrollView>
  );
}
