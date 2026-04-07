import React from 'react';
import { Link } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { VStack } from '@/components/ui/vstack';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ModalScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  return (
    <Box className="flex-1 items-center justify-center px-6" style={{ backgroundColor }}>
      <Box 
        className="rounded-[40px] p-10 w-full max-w-[420px] border-2 shadow-2xl items-center" 
        style={{ backgroundColor: cardColor, borderColor: `${primaryColor}15` }}
      >
        <Box className="w-16 h-16 rounded-[24px] bg-gray-50 items-center justify-center mb-8 rotate-6 shadow-sm border" style={{ borderColor }}>
            <IconSymbol name="info.circle.fill" size={30} color={primaryColor} />
        </Box>
        
        <VStack space="md" className="items-center">
          <Text className="text-2xl font-extrabold text-center uppercase tracking-widest" style={{ color: textColor }}>
            Focused Action
          </Text>
          <Text className="text-sm font-medium text-center leading-6 opacity-80" style={{ color: subtextColor }}>
            This isolated space is dedicated to primary interactions that require your complete attention.
          </Text>
          
          <Link href="/" dismissTo asChild>
            <Pressable 
                className="mt-6 px-8 py-4 rounded-[20px] shadow-xl" 
                style={{ backgroundColor: primaryColor }}
            >
              <Text className="text-xs font-extrabold uppercase tracking-widest text-white">Return to Hub</Text>
            </Pressable>
          </Link>
        </VStack>
      </Box>
    </Box>
  );
}
