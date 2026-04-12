import React from 'react';
import { ThemeMode } from '@/store/theme-store';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';

type ThemeModeSelectorProps = {
  borderColor: string;
  primaryColor: string;
  subtextColor: string;
  textColor: string;
  theme: ThemeMode;
  onChange: (mode: ThemeMode) => void;
};

export function ThemeModeSelector({
  borderColor,
  onChange,
  primaryColor,
  subtextColor,
  textColor,
  theme,
}: ThemeModeSelectorProps) {
  return (
    <HStack space="xs" className="mb-6 mx-2">
      {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => {
        const active = theme === mode;
        return (
          <Pressable
            key={mode}
            className="flex-1 h-12 rounded-2xl items-center justify-center border"
            style={{
              borderColor: active ? primaryColor : borderColor,
              backgroundColor: active ? primaryColor : `${subtextColor}05`,
            }}
            onPress={() => onChange(mode)}
          >
            <Text
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: active ? '#fff' : textColor }}
            >
              {mode}
            </Text>
          </Pressable>
        );
      })}
    </HStack>
  );
}
