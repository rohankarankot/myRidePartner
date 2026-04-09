import React from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { ActivityFilterTab } from '@/features/trips/constants/activity';

type ActivityEmptyStateProps = {
  activeTab: ActivityFilterTab;
  onFindRide: () => void;
  primaryColor: string;
  subtextColor: string;
  textColor: string;
};

export function ActivityEmptyState({
  activeTab,
  onFindRide,
  primaryColor,
  subtextColor,
  textColor,
}: ActivityEmptyStateProps) {
  return (
    <VStack className="items-center justify-center py-[100px]" space="lg">
      <Box className="w-20 h-20 rounded-[32px] bg-gray-50 items-center justify-center rotate-3 shadow-xl">
        <IconSymbol name="list.bullet" size={40} color={subtextColor} />
      </Box>
      <VStack className="items-center" space="xs">
        <Text className="text-3xl font-extrabold text-center" style={{ color: textColor }}>
          No recent activity
        </Text>
        <Text className="text-sm font-medium text-center leading-6 max-w-[240px]" style={{ color: subtextColor }}>
          Your {activeTab.replace('-', ' ')} activity is empty. Start a trip or join one to see updates here.
        </Text>
      </VStack>
      <Pressable
        className="rounded-2xl px-8 py-3.5 mt-4 shadow-sm border"
        style={{ backgroundColor: `${primaryColor}10`, borderColor: primaryColor }}
        onPress={onFindRide}
      >
        <Text className="text-sm font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
          Find a ride
        </Text>
      </Pressable>
    </VStack>
  );
}
