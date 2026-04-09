import React from 'react';
import { CommunityMember } from '@/types/api';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type CommunityMemberCardProps = {
  borderColor: string;
  cardColor: string;
  item: CommunityMember;
  onPress: () => void;
  subtextColor: string;
  textColor: string;
};

const getMemberName = (member: CommunityMember) =>
  member.userProfile?.fullName || member.username || 'Member';

const getAvatarUrl = (member: CommunityMember) =>
  typeof member.userProfile?.avatar === 'string'
    ? member.userProfile.avatar
    : member.userProfile?.avatar?.url;

export function CommunityMemberCard({
  borderColor,
  cardColor,
  item,
  onPress,
  subtextColor,
  textColor,
}: CommunityMemberCardProps) {
  return (
    <Pressable
      className="rounded-[28px] border p-4 mb-3 shadow-sm"
      style={{ backgroundColor: cardColor, borderColor }}
      onPress={onPress}
    >
      <HStack className="items-center" space="md">
        <Avatar size="md" className="border shadow-sm" style={{ borderColor }}>
          <AvatarFallbackText>{getMemberName(item)}</AvatarFallbackText>
          {getAvatarUrl(item) ? (
            <AvatarImage source={{ uri: getAvatarUrl(item)! }} alt={getMemberName(item)} />
          ) : null}
        </Avatar>
        <VStack className="flex-1" space="xs">
          <Text className="text-base font-bold" style={{ color: textColor }} numberOfLines={1}>
            {getMemberName(item)}
          </Text>
          <Text className="text-xs font-medium" style={{ color: subtextColor }} numberOfLines={1}>
            {item.userProfile?.city || item.email}
          </Text>
        </VStack>
      </HStack>
    </Pressable>
  );
}
