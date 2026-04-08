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
    title: '2. User Responsibilities',
    body: 'Users are responsible for their own safety and behavior. My Ride Partner is a platform to connect riders and captains.',
    icon: 'person.fill.checkmark'
  },
  {
    title: '3. Privacy Policy',
    body: 'We value your privacy. Your data is used only to facilitate ride sharing and improve our services.',
    icon: 'lock.fill'
  },
  {
    title: '4. Verification',
    body: "While we strive for a safe community, users should verify each other's identity before starting a ride.",
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
