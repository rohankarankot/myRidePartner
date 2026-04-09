import React from 'react';
import { ScrollView } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Skeleton } from '@/components/skeleton';
import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

export function ActivitySkeleton() {
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  return (
    <Box className="flex-1" style={{ backgroundColor }}>
      <Box className="border-b" style={{ borderBottomColor: borderColor }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12 }}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              width={index === 1 ? 112 : 94}
              height={38}
              borderRadius={999}
              style={{ marginRight: 8 }}
            />
          ))}
        </ScrollView>
      </Box>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Skeleton width="38%" height={18} borderRadius={9} style={{ marginBottom: 16 }} />

        {Array.from({ length: 4 }).map((_, index) => (
          <Box
            key={index}
            className="rounded-[32px] p-5 mb-4 border"
            style={{ backgroundColor: cardColor, borderColor }}
          >
            <HStack className="items-start justify-between mb-4">
              <HStack className="flex-1 items-center" space="md">
                <Skeleton width={44} height={44} borderRadius={22} />
                <VStack className="flex-1" space="xs">
                  <Skeleton width={index % 2 === 0 ? '52%' : '44%'} height={16} borderRadius={8} />
                  <Skeleton width="36%" height={14} borderRadius={7} />
                </VStack>
              </HStack>
              <VStack className="items-end" space="xs">
                <Skeleton width={74} height={24} borderRadius={12} />
                <Skeleton width={68} height={20} borderRadius={10} />
              </VStack>
            </HStack>

            <HStack className="mb-4 items-start">
              <VStack className="items-center mr-3 pt-1">
                <Skeleton width={8} height={8} borderRadius={4} />
                <Skeleton width={2} height={34} borderRadius={1} style={{ marginVertical: 4 }} />
                <Skeleton width={8} height={8} borderRadius={4} />
              </VStack>

              <VStack className="flex-1" space="md">
                <Skeleton width={index % 2 === 0 ? '80%' : '68%'} height={16} borderRadius={8} />
                <Skeleton width={index % 2 === 0 ? '72%' : '84%'} height={16} borderRadius={8} />
              </VStack>
            </HStack>

            <Divider style={{ backgroundColor: borderColor, marginBottom: 16 }} />

            <HStack className="items-center justify-between">
              <Skeleton width={120} height={24} borderRadius={12} />
              <Skeleton width={20} height={20} borderRadius={10} />
            </HStack>
          </Box>
        ))}
      </ScrollView>
    </Box>
  );
}
