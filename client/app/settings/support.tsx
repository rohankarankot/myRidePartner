import React from 'react';
import { Linking, ScrollView, StyleSheet } from 'react-native';
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
    question: 'How do I join a ride?',
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
    <ScrollView style={[styles.container, { backgroundColor }]} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Help & Support' }} />

      <Text className="text-xs font-bold uppercase ml-2 mb-2 mt-2" style={{ color: subtextColor }}>
        Contact Us
      </Text>
      <Box className="rounded-2xl p-4 mb-6" style={{ backgroundColor: cardColor }}>
        <Pressable onPress={() => Linking.openURL(`mailto:${CONFIG.SUPPORT_EMAIL}`)}>
          <HStack className="items-center justify-between">
            <HStack space="md" className="items-center flex-1">
              <Box
                className="h-10 w-10 rounded-full items-center justify-center"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <IconSymbol name="envelope.fill" size={20} color={primaryColor} />
              </Box>
              <VStack className="flex-1" space="xs">
                <Text className="text-base font-semibold" style={{ color: textColor }}>
                  Email Support
                </Text>
                <Text className="text-sm" style={{ color: subtextColor }}>
                  {CONFIG.SUPPORT_EMAIL}
                </Text>
              </VStack>
            </HStack>
            <IconSymbol name="chevron.right" size={20} color={subtextColor} />
          </HStack>
        </Pressable>
      </Box>

      <Text className="text-xs font-bold uppercase ml-2 mb-2" style={{ color: subtextColor }}>
        Frequently Asked Questions
      </Text>
      <Box className="rounded-2xl overflow-hidden" style={{ backgroundColor: cardColor }}>
        {FAQS.map((faq, index) => (
          <React.Fragment key={faq.question}>
            <Box className="p-4">
              <Text className="text-[15px] font-bold mb-2" style={{ color: textColor }}>
                {faq.question}
              </Text>
              <Text className="text-sm leading-5" style={{ color: subtextColor }}>
                {faq.answer}
              </Text>
            </Box>
            {index < FAQS.length - 1 ? <Divider style={{ backgroundColor: borderColor }} /> : null}
          </React.Fragment>
        ))}
      </Box>
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
