import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By using My Ride Partner, you agree to these terms. If you do not agree, please do not use the service.',
  },
  {
    title: '2. User Responsibilities',
    body: 'Users are responsible for their own safety and behavior. My Ride Partner is a platform to connect riders and captains.',
  },
  {
    title: '3. Privacy Policy',
    body: 'We value your privacy. Your data is used only to facilitate ride sharing and improve our services.',
  },
  {
    title: '4. Verification',
    body: "While we strive for a safe community, users should verify each other's identity before starting a ride.",
  },
];

export default function TermsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'Terms & Privacy', headerBackTitle: 'Back', headerRight: () => null }} />
      <Box className="p-5">
        <Box className="rounded-3xl p-5" style={[styles.cardShadow, { backgroundColor: cardColor }]}>
          <VStack space="lg">
            {SECTIONS.map((section) => (
              <VStack key={section.title} space="sm">
                <Text className="text-xl font-bold" style={{ color: textColor }}>
                  {section.title}
                </Text>
                <Text className="text-sm leading-6" style={{ color: subtextColor }}>
                  {section.body}
                </Text>
              </VStack>
            ))}
          </VStack>
        </Box>

        <Box className="items-center pt-10 pb-10">
          <Text className="text-xs" style={{ color: subtextColor }}>
            Last updated: March, 2026
          </Text>
        </Box>
      </Box>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardShadow: {
    shadowColor: '#2A120B',
    shadowOpacity: 0.05,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
});
