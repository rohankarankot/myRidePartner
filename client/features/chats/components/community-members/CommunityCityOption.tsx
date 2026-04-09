import React from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';

type CommunityCityOptionProps = {
  isActive: boolean;
  item: string;
  onPress: () => void;
  primaryColor: string;
  subtextColor: string;
  textColor: string;
};

export function CommunityCityOption({
  isActive,
  item,
  onPress,
  primaryColor,
  subtextColor,
  textColor,
}: CommunityCityOptionProps) {
  return (
    <Pressable
      className="mx-6 mb-2 rounded-2xl p-4 border"
      style={{
        backgroundColor: isActive ? `${primaryColor}05` : 'transparent',
        borderColor: isActive ? primaryColor : 'transparent',
      }}
      onPress={onPress}
    >
      <HStack className="items-center" space="md">
        <Box
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: isActive ? primaryColor : `${subtextColor}10` }}
        >
          <IconSymbol
            name={item === 'All cities' ? 'globe' : 'mappin.circle.fill'}
            size={18}
            color={isActive ? '#FFFFFF' : subtextColor}
          />
        </Box>
        <Text
          className="flex-1 text-base font-bold"
          style={{ color: isActive ? primaryColor : textColor }}
        >
          {item}
        </Text>
        {isActive ? (
          <Box className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: primaryColor }}>
            <IconSymbol name="checkmark" size={12} color="#FFFFFF" />
          </Box>
        ) : null}
      </HStack>
    </Pressable>
  );
}
