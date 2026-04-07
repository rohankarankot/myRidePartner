import React from 'react';
import { Skeleton } from '@/components/skeleton/Skeleton';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';

export function FindRidesSkeleton() {
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  return (
    <Box className="flex-1" style={{ backgroundColor }}>
      <VStack className="p-5 pt-2" space="xl">
        {/* Search Bar Skeleton */}
        <HStack 
            className="items-center px-4 h-14 rounded-[24px] border-2 shadow-sm" 
            style={{ backgroundColor: cardColor, borderColor }}
            space="md"
        >
          <Skeleton width={20} height={20} borderRadius={10} />
          <Skeleton width="60%" height={16} borderRadius={8} />
        </HStack>

        <VStack space="md">
            <Skeleton width="45%" height={24} borderRadius={12} />
            <Skeleton width="100%" height={100} borderRadius={32} />
        </VStack>

        {/* List of Trip Card Skeletons */}
        {Array.from({ length: 3 }).map((_, index) => (
          <Box
            key={index}
            className="rounded-[32px] p-5 border-2 shadow-sm"
            style={{ backgroundColor: cardColor, borderColor }}
          >
            <HStack className="items-center mb-5" space="md">
              <Skeleton width={48} height={48} borderRadius={24} />
              <VStack className="flex-1" space="xs">
                <Skeleton width="50%" height={16} borderRadius={8} />
                <Skeleton width="30%" height={12} borderRadius={6} />
              </VStack>
              <Skeleton width={60} height={24} borderRadius={12} />
            </HStack>

            <HStack className="items-center" space="md">
              <VStack className="items-center w-5" space="sm">
                <Skeleton width={10} height={10} borderRadius={5} />
                <Skeleton width={2} height={40} borderRadius={1} />
                <Skeleton width={10} height={10} borderRadius={5} />
              </VStack>
              <VStack className="flex-1" space="lg">
                <Skeleton width="85%" height={16} borderRadius={8} />
                <Skeleton width="75%" height={16} borderRadius={8} />
              </VStack>
            </HStack>

            <Box className="h-0.5 mt-6 mb-5" style={{ backgroundColor: borderColor }} />

            <HStack className="justify-between items-center" space="md">
               <HStack className="items-center" space="sm">
                    <Skeleton width={16} height={16} borderRadius={8} />
                    <Skeleton width={80} height={14} borderRadius={7} />
               </HStack>
               <Skeleton width={100} height={24} borderRadius={12} />
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
