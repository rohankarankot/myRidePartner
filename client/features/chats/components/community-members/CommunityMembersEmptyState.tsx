import React from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type CommunityMembersEmptyStateProps = {
  borderColor: string;
  cardColor: string;
  subtextColor: string;
  textColor: string;
};

export function CommunityMembersEmptyState({
  borderColor,
  cardColor,
  subtextColor,
  textColor,
}: CommunityMembersEmptyStateProps) {
  return (
    <VStack className="rounded-[32px] border items-center px-8 py-12 mt-4" style={{ backgroundColor: cardColor, borderColor }} space="md">
      <Box className="w-16 h-16 rounded-full bg-gray-50 items-center justify-center">
        <IconSymbol name="person.crop.circle.badge.exclamationmark" size={32} color={subtextColor} />
      </Box>
      <Text className="text-xl font-extrabold text-center" style={{ color: textColor }}>
        No members found
      </Text>
      <Text className="text-sm text-center leading-6" style={{ color: subtextColor }}>
        Try another city filter to see more community members.
      </Text>
    </VStack>
  );
}
