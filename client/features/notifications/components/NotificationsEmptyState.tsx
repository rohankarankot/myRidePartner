import React from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type NotificationsEmptyStateProps = {
  subtextColor: string;
  textColor: string;
};

export function NotificationsEmptyState({
  subtextColor,
  textColor,
}: NotificationsEmptyStateProps) {
  return (
    <VStack className="items-center justify-center pt-24 px-10" space="lg">
      <Box className="w-20 h-20 rounded-[32px] bg-gray-50 items-center justify-center rotate-3 shadow-xl">
        <IconSymbol name="bell.slash.fill" size={34} color={subtextColor} />
      </Box>
      <VStack className="items-center" space="xs">
        <Text className="text-2xl font-extrabold text-center" style={{ color: textColor }}>
          Quiet in here
        </Text>
        <Text className="text-sm font-medium text-center leading-6" style={{ color: subtextColor }}>
          We&apos;ll ping you here when your ride requests are approved or when new trips match your route.
        </Text>
      </VStack>
    </VStack>
  );
}
