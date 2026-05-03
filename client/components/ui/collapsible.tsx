import React, { PropsWithChildren, useState } from 'react';
import { LayoutAnimation } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeStore } from '@/store/theme-store';
import { Box } from '@/components/ui/box';
import { Pressable } from '@/components/ui/pressable';
import { HStack } from '@/components/ui/hstack';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';
  const palette = useThemeStore((state) => state.palette);
  const colors = getThemeColors(palette);
  const iconColor = theme === 'light' ? colors.light.icon : colors.dark.icon;

  const toggleOpen = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen((value) => !value);
  };

  return (
    <Box>
      <Pressable
        onPress={toggleOpen}
        className="flex-row items-center py-2"
        style={{ gap: 8 }}
      >
        <Box 
            className="w-6 h-6 items-center justify-center rounded-full bg-gray-50/50"
            style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] } as any}
        >
            <IconSymbol
              name="chevron.right"
              size={14}
              weight="bold"
              color={iconColor}
            />
        </Box>

        <ThemedText type="defaultSemiBold" className="flex-1">{title}</ThemedText>
      </Pressable>
      
      {isOpen && (
        <Box className="mt-2 ml-8 pb-4">
            {children}
        </Box>
      )}
    </Box>
  );
}
