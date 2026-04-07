import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

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
      'If you have questions regarding this Privacy Policy, please contact us at privacy@myridepartner.com.',
  },
];

export default function PrivacySettingsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');

  return (
    <ScrollView style={[styles.container, { backgroundColor }]} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Privacy & Policy' }} />

      <Box className="rounded-2xl p-5 mb-4" style={{ backgroundColor: cardColor }}>
        <Text className="text-xs font-semibold uppercase mb-3" style={{ color: subtextColor }}>
          Privacy Policy
        </Text>
        <VStack space="lg">
          {SECTIONS.map((section) => (
            <VStack key={section.title} space="xs">
              <Text className="text-base font-bold" style={{ color: textColor }}>
                {section.title}
              </Text>
              <Text className="text-sm leading-6" style={{ color: subtextColor }}>
                {section.body}
              </Text>
            </VStack>
          ))}
        </VStack>
      </Box>

      <Text className="text-xs text-center" style={{ color: subtextColor }}>
        Last Updated: March 2026
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
});
