import React from 'react';
import { PaletteOptions, ThemePalette } from '@/constants/theme';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';

type PaletteSelectorProps = {
  borderColor: string;
  palette: ThemePalette;
  subtextColor: string;
  onChange: (paletteId: ThemePalette) => void;
};

export function PaletteSelector({
  borderColor,
  onChange,
  palette,
  subtextColor,
}: PaletteSelectorProps) {
  return (
    <HStack space="xs" className="mb-6 mx-2">
      {PaletteOptions.map((option) => {
        const active = palette === option.id;
        return (
          <Pressable
            key={option.id}
            accessibilityLabel={option.label}
            className="h-14 flex-1 items-center justify-center rounded-2xl border"
            style={{
              backgroundColor: active ? `${option.swatch}15` : `${subtextColor}05`,
              borderColor: active ? option.swatch : borderColor,
            }}
            onPress={() => onChange(option.id)}
          >
            <Box
              className="h-5 w-5 rounded-full border shadow-inner"
              style={{ backgroundColor: option.swatch, borderColor: 'white' }}
            />
          </Pressable>
        );
      })}
    </HStack>
  );
}
