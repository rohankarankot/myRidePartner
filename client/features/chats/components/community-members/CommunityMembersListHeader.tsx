import React from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type CommunityMembersListHeaderProps = {
  activeCityLabel: string;
  primaryColor: string;
  subtextColor: string;
  textColor: string;
};

export function CommunityMembersListHeader({
  activeCityLabel,
  primaryColor,
  subtextColor,
  textColor,
}: CommunityMembersListHeaderProps) {
  return (
    <VStack className="mb-6" space="md">
      <VStack space="xs">
        <Text className="text-3xl font-extrabold" style={{ color: textColor }}>
          Members
        </Text>
        <Text className="text-sm font-medium leading-5" style={{ color: subtextColor }}>
          Connect with travelers from your city and beyond.
        </Text>
      </VStack>
      <HStack className="items-center" space="sm">
        <Box
          className="rounded-full px-4 py-1.5 items-center justify-center border"
          style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}20` }}
        >
          <HStack space="xs" className="items-center">
            <IconSymbol name="mappin.circle.fill" size={12} color={primaryColor} />
            <Text className="text-xs font-bold leading-none" style={{ color: primaryColor }} numberOfLines={1}>
              {activeCityLabel}
            </Text>
          </HStack>
        </Box>
      </HStack>
    </VStack>
  );
}
