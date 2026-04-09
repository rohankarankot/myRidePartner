import React from 'react';
import { Skeleton } from '@/components/skeleton';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

type CreateTripEditSkeletonProps = {
  backgroundColor: string;
  borderColor: string;
  cardColor: string;
};

export function CreateTripEditSkeleton({
  backgroundColor,
  borderColor,
  cardColor,
}: CreateTripEditSkeletonProps) {
  return (
    <Box className="flex-1" style={{ backgroundColor }}>
      <VStack className="px-6 pt-8" space="lg">
        <VStack space="xs" className="mb-2">
          <Skeleton width="38%" height={28} borderRadius={14} />
          <Skeleton width="64%" height={16} borderRadius={8} />
        </VStack>

        <Box className="mx-6 rounded-[32px] border p-6" style={{ backgroundColor: cardColor, borderColor }}>
          <VStack space="md">
            {Array.from({ length: 6 }).map((_, index) => (
              <VStack key={index} space="xs">
                <Skeleton width={index % 2 === 0 ? 80 : 96} height={12} borderRadius={6} />
                <Skeleton width="100%" height={56} borderRadius={24} />
              </VStack>
            ))}
            <Skeleton width="100%" height={110} borderRadius={24} />
            <HStack space="md">
              <Skeleton width="31%" height={48} borderRadius={20} />
              <Skeleton width="31%" height={48} borderRadius={20} />
              <Skeleton width="31%" height={48} borderRadius={20} />
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}
