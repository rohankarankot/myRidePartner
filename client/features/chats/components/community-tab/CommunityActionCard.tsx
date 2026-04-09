import React from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type CommunityActionCardProps = {
  borderColor: string;
  cardColor: string;
  icon: string;
  onPress: () => void;
  primaryColor: string;
  subtitle: string;
  subtextColor: string;
  textColor: string;
  title: string;
};

export function CommunityActionCard({
  borderColor,
  cardColor,
  icon,
  onPress,
  primaryColor,
  subtitle,
  subtextColor,
  textColor,
  title,
}: CommunityActionCardProps) {
  return (
    <Pressable
      className="rounded-[28px] border p-5 mb-4 shadow-sm"
      style={{ backgroundColor: cardColor, borderColor }}
      onPress={onPress}
    >
      <HStack className="items-center justify-between">
        <Box
          className="h-12 w-12 rounded-full items-center justify-center shadow-inner"
          style={{ backgroundColor: `${primaryColor}10` }}
        >
          <IconSymbol name={icon as any} size={22} color={primaryColor} />
        </Box>
        <VStack className="flex-1 mx-4" space="xs">
          <Text className="text-base font-bold" style={{ color: textColor }}>
            {title}
          </Text>
          <Text className="text-xs font-medium leading-5" style={{ color: subtextColor }}>
            {subtitle}
          </Text>
        </VStack>
        <IconSymbol name="chevron.right" size={18} color={subtextColor} />
      </HStack>
    </Pressable>
  );
}
