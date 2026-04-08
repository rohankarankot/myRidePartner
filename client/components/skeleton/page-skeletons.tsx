import React from 'react';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Divider } from '@/components/ui/divider';
import { Skeleton } from '@/components/skeleton/Skeleton';

export function ListPageSkeleton({
  itemCount = 4,
  showHeader = true,
}: {
  itemCount?: number;
  showHeader?: boolean;
}) {
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  return (
    <Box className="flex-1" style={{ backgroundColor }}>
      <VStack className="p-5" space="lg">
        {showHeader ? (
          <VStack space="xs" className="mb-2">
            <Skeleton width="42%" height={28} borderRadius={14} />
            <Skeleton width="68%" height={16} borderRadius={8} />
          </VStack>
        ) : null}

        {Array.from({ length: itemCount }).map((_, index) => (
          <Box
            key={index}
            className="rounded-[28px] border p-5"
            style={{ backgroundColor: cardColor, borderColor }}
          >
            <HStack className="items-center" space="md">
              <Skeleton width={48} height={48} borderRadius={24} />
              <VStack className="flex-1" space="xs">
                <Skeleton width={index % 2 === 0 ? '48%' : '58%'} height={16} borderRadius={8} />
                <Skeleton width={index % 2 === 0 ? '72%' : '60%'} height={13} borderRadius={7} />
              </VStack>
              <Skeleton width={18} height={18} borderRadius={9} />
            </HStack>

            <Divider className="my-4" style={{ backgroundColor: borderColor }} />

            <Skeleton width={index % 2 === 0 ? '82%' : '74%'} height={13} borderRadius={7} />
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

export function DetailPageSkeleton() {
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  return (
    <Box className="flex-1" style={{ backgroundColor }}>
      <VStack className="p-5" space="lg">
        <Box className="rounded-[32px] border p-6" style={{ backgroundColor: cardColor, borderColor }}>
          <HStack className="items-center" space="lg">
            <Skeleton width={80} height={80} borderRadius={40} />
            <VStack className="flex-1" space="xs">
              <Skeleton width="46%" height={24} borderRadius={12} />
              <Skeleton width="58%" height={14} borderRadius={7} />
              <Skeleton width="40%" height={14} borderRadius={7} />
            </VStack>
          </HStack>
        </Box>

        {Array.from({ length: 3 }).map((_, index) => (
          <Box
            key={index}
            className="rounded-[32px] border p-6"
            style={{ backgroundColor: cardColor, borderColor }}
          >
            <Skeleton width={index === 0 ? 110 : index === 1 ? 140 : 120} height={16} borderRadius={8} className="mb-5" />
            <VStack space="md">
              <Skeleton width="76%" height={16} borderRadius={8} />
              <Skeleton width="60%" height={16} borderRadius={8} />
              <Skeleton width="88%" height={16} borderRadius={8} />
            </VStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

export function AnalyticsPageSkeleton() {
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  return (
    <Box className="flex-1" style={{ backgroundColor }}>
      <VStack className="p-6" space="lg">
        <VStack space="xs">
          <Skeleton width="44%" height={28} borderRadius={14} />
          <Skeleton width="66%" height={16} borderRadius={8} />
        </VStack>

        <Box className="rounded-[32px] border p-6" style={{ backgroundColor: cardColor, borderColor }}>
          <VStack space="lg">
            <Skeleton width="36%" height={16} borderRadius={8} />
            <HStack className="justify-between">
              <Skeleton width="28%" height={80} borderRadius={24} />
              <Skeleton width="28%" height={80} borderRadius={24} />
              <Skeleton width="28%" height={80} borderRadius={24} />
            </HStack>
            <Skeleton width="100%" height={180} borderRadius={28} />
            <Skeleton width="100%" height={120} borderRadius={28} />
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}
