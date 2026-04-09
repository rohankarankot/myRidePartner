import React from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

type CitySelectorTriggerProps = {
  borderColor: string;
  cardColor: string;
  onPress: () => void;
  primaryColor: string;
  selectedCity: string;
  subtextColor: string;
  textColor: string;
};

export function CitySelectorTrigger({
  borderColor,
  cardColor,
  onPress,
  primaryColor,
  selectedCity,
  subtextColor,
  textColor,
}: CitySelectorTriggerProps) {
  return (
    <Pressable
      className="flex-row items-center ml-4 px-3 py-1 rounded-full border shadow-sm"
      style={{ backgroundColor: cardColor, borderColor }}
      onPress={onPress}
    >
      <IconSymbol name="mappin.circle.fill" size={14} color={primaryColor} />
      <VStack className="ml-2">
        <Text className="text-[8px] font-extrabold uppercase tracking-tighter" style={{ color: subtextColor }}>
          City
        </Text>
        <HStack className="items-center" space="xs">
          <Text className="text-xs font-extrabold" style={{ color: textColor }}>
            {selectedCity || 'Select'}
          </Text>
          <IconSymbol name="chevron.down" size={10} color={primaryColor} />
        </HStack>
      </VStack>
    </Pressable>
  );
}
