import React from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type CommunityHeroCardProps = {
  borderColor: string;
  cardColor: string;
  isLoading: boolean;
  primaryColor: string;
  subtextColor: string;
  textColor: string;
  totalMembers: number;
};

export function CommunityHeroCard({
  borderColor,
  cardColor,
  isLoading,
  primaryColor,
  subtextColor,
  textColor,
  totalMembers,
}: CommunityHeroCardProps) {
  return (
    <Box
      className="rounded-[32px] border p-8 overflow-hidden"
      style={{ backgroundColor: cardColor, borderColor }}
    >
      <VStack space="lg">
        <HStack
          className="self-start items-center rounded-full px-3 py-1.5 border"
          space="xs"
          style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}20` }}
        >
          <IconSymbol
            name="bubble.left.and.bubble.right.fill"
            size={12}
            color={primaryColor}
          />
          <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
            City community
          </Text>
        </HStack>

        <VStack space="sm">
          <Text className="text-3xl font-extrabold" style={{ color: textColor }}>
            Travellers Community
          </Text>
          <Text className="text-sm font-medium leading-6" style={{ color: subtextColor }}>
            Talk routes, connect with nearby riders, and keep local travel
            conversations in one place.
          </Text>
        </VStack>

        <HStack className="items-center" space="sm">
          <Box
            className="h-8 w-8 rounded-full items-center justify-center shadow-inner"
            style={{ backgroundColor: `${primaryColor}10` }}
          >
            <IconSymbol name="person.2.fill" size={14} color={primaryColor} />
          </Box>
          {isLoading ? (
            <Spinner size="small" color={primaryColor} />
          ) : (
            <Text className="text-xs font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
              {totalMembers > 0 ? `${totalMembers} active members & growing rapidly` : 'Active members & growing rapidly'}
            </Text>
          )}
        </HStack>
      </VStack>
    </Box>
  );
}
