import React from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type ProfilePerformanceCardProps = {
  borderColor: string;
  cardColor: string;
  completedTripsCount: number;
  onOpenAnalytics: () => void;
  onOpenCompletedTrips: () => void;
  onOpenRatings: () => void;
  primaryColor: string;
  rating: number;
  subtextColor: string;
  textColor: string;
};

export function ProfilePerformanceCard({
  borderColor,
  cardColor,
  completedTripsCount,
  onOpenAnalytics,
  onOpenCompletedTrips,
  onOpenRatings,
  primaryColor,
  rating,
  subtextColor,
  textColor,
}: ProfilePerformanceCardProps) {
  return (
    <Box className="mx-6 rounded-[32px] p-6 mb-6 border" style={{ backgroundColor: cardColor, borderColor }}>
      <Text className="text-[10px] font-extrabold uppercase tracking-widest mb-6" style={{ color: subtextColor }}>
        Performance
      </Text>

      <HStack className="justify-between items-center">
        <Pressable className="flex-1 items-center" onPress={onOpenRatings}>
          <VStack className="items-center" space="xs">
            <Box className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: `${primaryColor}10` }}>
              <IconSymbol name="star.fill" size={20} color="#F59E0B" />
            </Box>
            <Text className="text-xl font-extrabold" style={{ color: textColor }}>{Number(rating).toFixed(1)}</Text>
            <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: subtextColor }}>Rating</Text>
          </VStack>
        </Pressable>

        <Divider className="h-10 w-px" style={{ backgroundColor: borderColor }} />

        <Pressable className="flex-1 items-center" onPress={onOpenCompletedTrips}>
          <VStack className="items-center" space="xs">
            <Box className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: `${primaryColor}10` }}>
              <IconSymbol name="flag.checkered" size={18} color={primaryColor} />
            </Box>
            <Text className="text-xl font-extrabold" style={{ color: textColor }}>{completedTripsCount}</Text>
            <Text className="text-[10px] font-bold uppercase tracking-widest text-center" style={{ color: subtextColor }}>Trip Count</Text>
          </VStack>
        </Pressable>

        <Divider className="h-10 w-px" style={{ backgroundColor: borderColor }} />

        <Pressable className="flex-1 items-center" onPress={onOpenAnalytics}>
          <VStack className="items-center" space="xs">
            <Box className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: `${primaryColor}10` }}>
              <IconSymbol name="chart.bar.fill" size={18} color="#8B5CF6" />
            </Box>
            <Text className="text-xl font-extrabold" style={{ color: textColor }}>View</Text>
            <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: subtextColor }}>Insights</Text>
          </VStack>
        </Pressable>
      </HStack>
    </Box>
  );
}
