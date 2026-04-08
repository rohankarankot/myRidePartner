import React from 'react';
import { Skeleton } from '@/components/skeleton/Skeleton';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Divider } from '@/components/ui/divider';

export function TripDetailsSkeleton() {
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <Box className="flex-1" style={{ backgroundColor }}>
      <VStack className="p-6" space="xl">
        {/* Route Card Skeleton */}
        <Box className="rounded-[32px] p-6 border-2 shadow-sm" style={{ backgroundColor: cardColor, borderColor }}>
          <HStack space="md">
            <VStack className="items-center w-5" space="xs">
              <Box className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
              <Box className="w-0.5 h-12" style={{ backgroundColor: borderColor }} />
              <Box className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#10B981' }} />
            </VStack>
            <VStack className="flex-1" space="xl">
              <HStack className="justify-between items-center" space="md">
                <Skeleton width="70%" height={18} borderRadius={9} />
                <Skeleton width={80} height={24} borderRadius={12} />
              </HStack>
              <Skeleton width="60%" height={18} borderRadius={9} />
            </VStack>
          </HStack>
        </Box>

        {/* Info Grid Card Skeleton */}
        <Box className="rounded-[32px] p-6 border-2 shadow-sm" style={{ backgroundColor: cardColor, borderColor }}>
          <VStack space="lg">
            <HStack className="justify-between" space="md">
              <InfoItemSkeleton />
              <InfoItemSkeleton />
            </HStack>
            <Divider style={{ backgroundColor: borderColor }} />
            <HStack className="justify-between" space="md">
              <InfoItemSkeleton labelWidth={60} valueWidth={100} />
              <InfoItemSkeleton labelWidth={40} valueWidth={80} />
            </HStack>
            <Divider style={{ backgroundColor: borderColor }} />
            <InfoItemSkeleton labelWidth={80} valueWidth={120} />
          </VStack>
        </Box>

        {/* Chat Button Skeleton */}
        <Skeleton width="100%" height={56} borderRadius={28} />

        {/* Notes Card Skeleton */}
        <Box className="rounded-[32px] p-6 border-2 shadow-sm" style={{ backgroundColor: cardColor, borderColor }}>
           <Skeleton width={120} height={18} borderRadius={9} className="mb-4" />
           <VStack space="sm">
             <Skeleton width="100%" height={14} borderRadius={7} />
             <Skeleton width="85%" height={14} borderRadius={7} />
           </VStack>
        </Box>

        {/* Captain Card Skeleton */}
        <Box className="rounded-[32px] p-6 border-2 shadow-sm" style={{ backgroundColor: cardColor, borderColor }}>
           <Skeleton width={80} height={18} borderRadius={9} className="mb-5" />
           <HStack className="items-center" space="md">
              <Skeleton width={56} height={56} borderRadius={28} />
              <VStack className="flex-1" space="xs">
                <Skeleton width="60%" height={16} borderRadius={8} />
                <Skeleton width="40%" height={12} borderRadius={6} />
              </VStack>
           </HStack>
        </Box>

        {/* Safety Actions Skeleton */}
        <Box className="rounded-[32px] p-6 border-2 shadow-sm" style={{ backgroundColor: cardColor, borderColor }}>
           <Skeleton width={70} height={18} borderRadius={9} className="mb-5" />
           <HStack space="md">
              <Skeleton width="48%" height={50} borderRadius={16} />
              <Skeleton width="48%" height={50} borderRadius={16} />
           </HStack>
        </Box>

        {/* Primary Action Button Skeleton */}
        <Skeleton width="100%" height={56} borderRadius={28} />
      </VStack>
    </Box>
  );
}

function InfoItemSkeleton({ labelWidth = 50, valueWidth = 70 }: { labelWidth?: number; valueWidth?: number }) {
  return (
    <VStack className="flex-1" space="xs">
      <HStack className="items-center" space="xs">
        <Skeleton width={16} height={16} borderRadius={8} />
        <Skeleton width={labelWidth} height={12} borderRadius={6} />
      </HStack>
      <Skeleton width={valueWidth} height={16} borderRadius={8} className="mt-1" />
    </VStack>
  );
}
