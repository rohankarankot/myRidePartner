import React from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Pressable } from '@/components/ui/pressable';

type FindRidesFilterFabProps = {
  onPress: () => void;
  primaryColor: string;
};

export function FindRidesFilterFab({ onPress, primaryColor }: FindRidesFilterFabProps) {
  return (
    <Pressable
      className="absolute right-6 bottom-8 h-16 w-16 rounded-full items-center justify-center shadow-xl"
      style={{ backgroundColor: primaryColor }}
      onPress={onPress}
    >
      <IconSymbol name="slider.horizontal.3" size={24} color="#fff" />
    </Pressable>
  );
}
