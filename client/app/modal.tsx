import React from 'react';
import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { VStack } from '@/components/ui/vstack';

export default function ModalScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <Box className="flex-1 items-center justify-center px-5" style={{ backgroundColor }}>
      <Box className="rounded-3xl p-8 w-full max-w-[420px]" style={[styles.cardShadow, { backgroundColor: cardColor }]}>
        <VStack space="md" className="items-center">
          <Text className="text-2xl font-bold text-center" style={{ color: textColor }}>
            This is a modal
          </Text>
          <Text className="text-sm text-center leading-6" style={{ color: subtextColor }}>
            Use this space for focused actions that deserve a quieter, isolated moment.
          </Text>
          <Link href="/" dismissTo asChild>
            <Pressable className="mt-2 px-5 py-3 rounded-2xl" style={{ backgroundColor: primaryColor }}>
              <Text className="text-sm font-semibold text-white">Go to home screen</Text>
            </Pressable>
          </Link>
        </VStack>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#2A120B',
    shadowOpacity: 0.05,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
});
