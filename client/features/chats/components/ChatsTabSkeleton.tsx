import React from 'react';
import { Skeleton } from '@/components/skeleton/Skeleton';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';

export function ChatsTabSkeleton() {
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  return (
    <Box className="flex-1" style={{ backgroundColor }}>
      <VStack className="p-4" space="md">
        {Array.from({ length: 5 }).map((_, index) => (
          <Box
            key={index}
            className="rounded-[32px] p-5 border-2 shadow-sm"
            style={{ backgroundColor: cardColor, borderColor }}
          >
            <HStack space="md">
              <Skeleton width={56} height={56} borderRadius={28} />
              
              <VStack className="flex-1" space="xs">
                <HStack className="justify-between items-center mb-1">
                  <Skeleton width={index % 2 === 0 ? '55%' : '65%'} height={16} borderRadius={8} />
                  <Skeleton width={70} height={22} borderRadius={11} />
                </HStack>
                
                <Skeleton width="90%" height={13} borderRadius={7} />
                <Skeleton width="70%" height={13} borderRadius={7} className="mt-1" />

                <HStack className="justify-between items-center mt-4">
                  <HStack className="items-center" space="xs">
                    <Skeleton width={14} height={14} borderRadius={7} />
                    <Skeleton width={index % 2 === 0 ? 120 : 140} height={12} borderRadius={6} />
                  </HStack>
                  <Skeleton width={20} height={20} borderRadius={10} />
                </HStack>
              </VStack>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
