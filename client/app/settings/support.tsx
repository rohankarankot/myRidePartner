import React from 'react';
import { Linking, ScrollView } from 'react-native';
import { Stack } from 'expo-router';

import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CONFIG } from '@/constants/config';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Divider } from '@/components/ui/divider';

const FAQS = [
  {
    question: 'How do I publish a ride?',
    answer:
      "Tap the 'Publish' tab at the bottom of the screen, fill in your trip details, vehicle info, and price, then publish it.",
  },
  {
    question: 'How do join a ride?',
    answer:
      "Find a suitable ride on the 'Find' or 'Explore' page, open the trip details, and tap the request button.",
  },
  {
    question: 'How are prices determined?',
    answer:
      'Captains set the price per seat based on distance and travel costs so the overall expense can be split fairly.',
  },
  {
    question: 'Can I cancel a request?',
    answer:
      'Yes. You can cancel a pending or approved join request from the trip details page before the trip starts.',
  },
];

export default function HelpSupportScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  return (
    <ScrollView style={{ flex: 1, backgroundColor }} contentContainerStyle={{ paddingBottom: 40 }}>
      <Stack.Screen options={{ title: 'Help & Support', headerTitleStyle: { fontWeight: '800' } }} />

      <VStack className="px-6 py-8" space="xs">
          <Text className="text-3xl font-extrabold" style={{ color: textColor }}>Help & Support</Text>
          <Text className="text-sm font-medium" style={{ color: subtextColor }}>Find answers to common questions or reach out to us.</Text>
      </VStack>

      <Box className="mx-6 rounded-[32px] p-6 mb-6 shadow-sm border" style={{ backgroundColor: cardColor, borderColor }}>
        <Text className="text-[10px] font-extrabold uppercase tracking-widest mb-4" style={{ color: subtextColor }}>
          Contact Us
        </Text>
        <Pressable 
            className="rounded-2xl p-4 border" 
            style={{ backgroundColor: `${primaryColor}05`, borderColor: `${primaryColor}20` }}
            onPress={() => Linking.openURL(`mailto:${CONFIG.SUPPORT_EMAIL}`)}
        >
          <HStack className="items-center justify-between">
            <HStack space="md" className="items-center flex-1">
              <Box
                className="h-10 w-10 rounded-full items-center justify-center shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                <IconSymbol name="envelope.fill" size={18} color="#fff" />
              </Box>
              <VStack className="flex-1" space="xs">
                <Text className="text-base font-bold" style={{ color: textColor }}>
                  Email Support
                </Text>
                <Text className="text-xs font-semibold" style={{ color: primaryColor }}>
                  {CONFIG.SUPPORT_EMAIL}
                </Text>
              </VStack>
            </HStack>
            <IconSymbol name="chevron.right" size={16} color={primaryColor} />
          </HStack>
        </Pressable>
      </Box>

      <Box className="mx-6 rounded-[32px] p-6 shadow-sm border" style={{ backgroundColor: cardColor, borderColor }}>
        <Text className="text-[10px] font-extrabold uppercase tracking-widest mb-5" style={{ color: subtextColor }}>
          Frequently Asked Questions
        </Text>
        <VStack space="xl">
            {FAQS.map((faq, index) => (
                <VStack key={faq.question} space="sm">
                <Text className="text-lg font-bold" style={{ color: textColor }}>
                    {faq.question}
                </Text>
                <Text className="text-sm font-medium leading-7" style={{ color: subtextColor }}>
                    {faq.answer}
                </Text>
                {index < FAQS.length - 1 && <Divider className="mt-4" style={{ backgroundColor: borderColor }} />}
                </VStack>
            ))}
        </VStack>
      </Box>

      <VStack className="items-center py-12" space="xs">
          <Divider className="w-12 mb-4" style={{ backgroundColor: borderColor }} />
        <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
          Our support team is here to help
        </Text>
      </VStack>
    </ScrollView>
  );
}
