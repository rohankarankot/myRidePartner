import React from 'react';
import { ScrollView } from 'react-native';
import { Stack } from 'expo-router';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Divider } from '@/components/ui/divider';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By using My Ride Partner, you agree to these terms. If you do not agree, please do not use the service.',
    icon: 'checkmark.seal.fill'
  },
  {
    title: '2. Information Collection',
    body: 'We collect your name and email through Google Sign-In. To facilitate ride-sharing, we collect your precise geographical location (GPS) while the app is in use. This data is essential for matching you with nearby ride partners and calculating distances.',
    icon: 'location.fill'
  },
  {
    title: '3. Data Usage & Advertising',
    body: 'Your data is used to improve our services and facilitate communication between members. We use Google AdMob to show ads. AdMob may use your device identifiers and location to serve relevant ads. You can manage your ad preferences in your device settings.',
    icon: 'chart.bar.fill'
  },
  {
    title: '4. Third-Party Services',
    body: 'We use Google Firebase for authentication and analytics. These services help us secure your account and understand app stability. By using this app, you also agree to the 3rd-party privacy policies of Google and AdMob.',
    icon: 'square.grid.2x2.fill'
  },
  {
    title: '5. Account Deletion',
    body: 'You have the right to delete your account and all associated data at any time. To request deletion, please contact support at rohan.alwayscodes@gmail.com. We will process your request within 48 hours.',
    icon: 'trash.fill'
  },
  {
    title: '6. User Responsibilities',
    body: "While we strive for a safe community, My Ride Partner is a platform for connection. Users are responsible for their own safety and must verify others' identity before starting a ride.",
    icon: 'shield.fill'
  },
];

export default function TermsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  return (
    <ScrollView style={{ flex: 1, backgroundColor }} contentContainerStyle={{ paddingBottom: 40 }}>
      <Stack.Screen 
        options={{ 
            title: 'Terms of Service', 
            headerBackTitle: 'Settings', 
            headerStyle: { backgroundColor },
            headerTintColor: textColor,
            headerShadowVisible: false,
            headerTitleStyle: { fontWeight: '800' }
        }} 
      />
      
      <Box className="p-6">
        <VStack className="mb-10 items-center">
            <Box className="w-16 h-16 rounded-[24px] bg-gray-50 items-center justify-center mb-6 shadow-sm border" style={{ borderColor }}>
                <IconSymbol name="doc.text.fill" size={28} color={primaryColor} />
            </Box>
            <Text className="text-3xl font-extrabold text-center uppercase tracking-widest" style={{ color: textColor }}>Legal Hub</Text>
            <Text className="text-sm font-medium mt-2" style={{ color: subtextColor }}>Rules of the road for our community</Text>
        </VStack>

        <Box className="rounded-[32px] p-6 border-2 shadow-2xl" style={{ backgroundColor: cardColor, borderColor: `${primaryColor}15` }}>
          <VStack space="xl">
            {SECTIONS.map((section, index) => (
              <VStack key={section.title} space="md">
                <HStack className="items-center" space="sm">
                  <Box className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: `${primaryColor}10` }}>
                    <IconSymbol name={section.icon as any} size={16} color={primaryColor} />
                  </Box>
                  <Text className="text-base font-extrabold" style={{ color: textColor }}>
                    {section.title}
                  </Text>
                </HStack>
                <Text className="text-sm font-medium leading-6 opacity-80" style={{ color: subtextColor }}>
                  {section.body}
                </Text>
                {index < SECTIONS.length - 1 && <Divider className="mt-4" style={{ backgroundColor: borderColor }} />}
              </VStack>
            ))}
          </VStack>
        </Box>

        <Box className="items-center pt-12">
          <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
            Last Update: March 15, 2026
          </Text>
        </Box>
      </Box>
    </ScrollView>
  );
}
