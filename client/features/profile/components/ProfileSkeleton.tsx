import React from 'react';
import { Skeleton } from '@/components/skeleton/Skeleton';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';

export function ProfileSkeleton() {
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  return (
    <Box className="flex-1" style={{ backgroundColor }}>
      <VStack className="p-6" space="xl">
        <VStack className="items-center mb-6" space="md">
          <Skeleton width={120} height={120} borderRadius={60} />
          <VStack className="items-center" space="xs">
            <Skeleton width={200} height={20} borderRadius={10} />
            <Skeleton width={140} height={14} borderRadius={7} />
            <Skeleton width={100} height={14} borderRadius={7} />
          </VStack>
          <Skeleton width={120} height={32} borderRadius={16} className="mt-2" />
        </VStack>

        <Box className="rounded-[32px] p-6 border-2 shadow-sm" style={{ backgroundColor: cardColor, borderColor }}>
          <Skeleton width={100} height={18} borderRadius={9} className="mb-4" />
          <VStack space="md">
            <HStack className="justify-between items-center py-2 border-b" style={{ borderBottomColor: borderColor }}>
              <Skeleton width="40%" height={14} borderRadius={7} />
              <Skeleton width={60} height={18} borderRadius={9} />
            </HStack>
            <HStack className="justify-between items-center py-2">
              <Skeleton width="50%" height={14} borderRadius={7} />
              <Skeleton width={40} height={18} borderRadius={9} />
            </HStack>
          </VStack>
        </Box>

        <Box className="rounded-[32px] p-6 border-2 shadow-sm" style={{ backgroundColor: cardColor, borderColor }}>
          <Skeleton width={160} height={18} borderRadius={9} className="mb-4" />
          <VStack space="md">
            {Array.from({ length: 4 }).map((_, index) => (
              <HStack 
                key={index} 
                className={`justify-between items-center py-2 ${index < 3 ? 'border-b' : ''}`} 
                style={{ borderBottomColor: index < 3 ? borderColor : 'transparent' }}
              >
                <Skeleton width="35%" height={14} borderRadius={7} />
                <Skeleton width={index === 0 ? 100 : index === 2 ? 150 : 90} height={16} borderRadius={8} />
              </HStack>
            ))}
          </VStack>
        </Box>

        <Box className="rounded-[32px] p-6 border-2 shadow-sm" style={{ backgroundColor: cardColor, borderColor }}>
          <VStack space="md">
            {Array.from({ length: 3 }).map((_, index) => (
              <HStack 
                key={index} 
                className={`justify-between items-center py-3 ${index < 2 ? 'border-b' : ''}`} 
                style={{ borderBottomColor: index < 2 ? borderColor : 'transparent' }}
              >
                <HStack className="items-center" space="md">
                  <Skeleton width={44} height={44} borderRadius={16} />
                  <Skeleton width={index === 0 ? 120 : index === 1 ? 140 : 110} height={16} borderRadius={8} />
                </HStack>
                <Skeleton width={16} height={16} borderRadius={8} />
              </HStack>
            ))}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}
