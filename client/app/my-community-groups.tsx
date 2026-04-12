import React from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { useThemeColor } from '@/hooks/use-theme-color';
import { communityGroupService } from '@/services/community-group-service';
import { CommunityGroup, CommunityGroupStatus } from '@/types/api';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Divider } from '@/components/ui/divider';

const STATUS_CONFIG: Record<CommunityGroupStatus, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: '#F59E0B' },
  APPROVED: { label: 'Approved', color: '#18A957' },
  REJECTED: { label: 'Rejected', color: '#DC2626' },
};

export default function MyCommunityGroupsScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  const { data: groups, isLoading } = useQuery({
    queryKey: ['my-community-groups'],
    queryFn: () => communityGroupService.getMyGroups(),
  });

  const renderGroup = ({ item }: { item: CommunityGroup }) => {
    const statusConfig = STATUS_CONFIG[item.status];

    return (
      <Pressable
        className="rounded-[28px] border p-5 mb-4"
        style={{ backgroundColor: cardColor, borderColor }}
        onPress={() => router.push(`/community-group/${item.documentId}`)}
      >
        <HStack className="items-center justify-between">
          <Box
            className="h-12 w-12 rounded-[20px] items-center justify-center"
            style={{ backgroundColor: `${primaryColor}10` }}
          >
            <IconSymbol name="person.3.fill" size={22} color={primaryColor} />
          </Box>

          <VStack className="flex-1 mx-4" space="xs">
            <HStack className="items-center" space="sm">
              <Text className="text-base font-bold flex-1" numberOfLines={1} style={{ color: textColor }}>
                {item.name}
              </Text>
              <Box
                className="rounded-full px-2.5 py-1 border"
                style={{
                  backgroundColor: `${statusConfig.color}12`,
                  borderColor: `${statusConfig.color}25`,
                }}
              >
                <Text className="text-[9px] font-extrabold uppercase tracking-widest" style={{ color: statusConfig.color }}>
                  {statusConfig.label}
                </Text>
              </Box>
            </HStack>
            <HStack className="items-center" space="xs">
              <IconSymbol name="person.2.fill" size={12} color={subtextColor} />
              <Text className="text-xs font-medium" style={{ color: subtextColor }}>
                {item.memberCount ?? 0} member{(item.memberCount ?? 0) !== 1 ? 's' : ''}
              </Text>
            </HStack>
          </VStack>

          <IconSymbol name="chevron.right" size={18} color={subtextColor} />
        </HStack>
      </Pressable>
    );
  };

  return (
    <Box style={{ flex: 1, backgroundColor }}>
      <Stack.Screen options={{ title: 'My Groups', headerTitleStyle: { fontWeight: '800' } }} />

      <VStack className="px-6 py-8" space="xs">
        <Text className="text-3xl font-extrabold" style={{ color: textColor }}>My Groups</Text>
        <Text className="text-sm font-medium" style={{ color: subtextColor }}>
          Groups you've created and joined.
        </Text>
      </VStack>

      {isLoading ? (
        <Box className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color={primaryColor} />
        </Box>
      ) : !groups?.length ? (
        <VStack className="items-center px-6 py-16" space="md">
          <Box
            className="h-20 w-20 rounded-[28px] items-center justify-center"
            style={{ backgroundColor: `${primaryColor}10` }}
          >
            <IconSymbol name="person.3.fill" size={36} color={primaryColor} />
          </Box>
          <Text className="text-lg font-bold text-center" style={{ color: textColor }}>
            No groups yet
          </Text>
          <Text className="text-sm font-medium text-center leading-6" style={{ color: subtextColor }}>
            Create your first community group and start connecting with like-minded riders.
          </Text>
          <Pressable
            className="mt-4 h-14 px-8 rounded-[22px] items-center justify-center"
            style={{ backgroundColor: primaryColor }}
            onPress={() => router.push('/create-community-group')}
          >
            <Text className="text-sm font-extrabold uppercase tracking-widest text-white">
              Create a Group
            </Text>
          </Pressable>
        </VStack>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderGroup}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <VStack className="items-center py-8" space="xs">
              <Divider className="w-12 mb-4" style={{ backgroundColor: borderColor }} />
              <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
                {groups.length} group{groups.length !== 1 ? 's' : ''}
              </Text>
            </VStack>
          }
        />
      )}
    </Box>
  );
}
