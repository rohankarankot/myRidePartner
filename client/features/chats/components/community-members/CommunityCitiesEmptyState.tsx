import React from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type CommunityCitiesEmptyStateProps = {
  borderColor: string;
  subtextColor: string;
  textColor: string;
};

export function CommunityCitiesEmptyState({
  borderColor,
  subtextColor,
  textColor,
}: CommunityCitiesEmptyStateProps) {
  return (
    <VStack className="items-center px-12 py-16" space="md">
      <IconSymbol name="magnifyingglass" size={40} color={borderColor} />
      <Text className="text-lg font-bold text-center" style={{ color: textColor }}>No matching cities</Text>
      <Text className="text-sm text-center" style={{ color: subtextColor }}>
        Try a different search keyword.
      </Text>
    </VStack>
  );
}
