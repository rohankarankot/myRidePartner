import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, TextInput, Dimensions, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth-context';
import { useDebounce } from '@/hooks/use-debounce';
import { useThemeColor } from '@/hooks/use-theme-color';
import { communityGroupService } from '@/services/community-group-service';
import { CommunityGroupMember, CommunityGroupStatus, SearchableUser } from '@/types/api';
import { CustomAlert } from '@/components/CustomAlert';
import { Image } from 'expo-image';
import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

const STATUS_CONFIG: Record<CommunityGroupStatus, { label: string; color: string }> = {
  PENDING: { label: 'Pending Approval', color: '#F59E0B' },
  APPROVED: { label: 'Approved', color: '#18A957' },
  REJECTED: { label: 'Rejected', color: '#DC2626' },
};

export default function CommunityGroupDetailScreen() {
  const { documentId } = useLocalSearchParams<{ documentId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');
  const dangerColor = '#DC2626';

  const [showAddMemberSheet, setShowAddMemberSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [removeMemberTarget, setRemoveMemberTarget] = useState<CommunityGroupMember | null>(null);
  const [memberActionTarget, setMemberActionTarget] = useState<CommunityGroupMember | null>(null);
  const [memberActionLoading, setMemberActionLoading] = useState(false);
  const [deleteGroupConfirmVisible, setDeleteGroupConfirmVisible] = useState(false);
  const [consentError, setConsentError] = useState<{ show: boolean; userName?: string }>({ show: false });

  const groupQuery = useQuery({
    queryKey: ['community-group', documentId],
    queryFn: () => communityGroupService.getGroupDetail(documentId!),
    enabled: !!documentId,
  });

  const searchUsersQuery = useQuery({
    queryKey: ['search-users', debouncedSearchQuery],
    queryFn: () => communityGroupService.searchUsers(debouncedSearchQuery),
    enabled: debouncedSearchQuery.trim().length >= 2,
  });

  const addMemberMutation = useMutation({
    mutationFn: (userId: number) => communityGroupService.addMember(documentId!, userId),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Member Added', text2: 'User has been added to the group.' });
      void queryClient.invalidateQueries({ queryKey: ['community-group', documentId] });
      setShowAddMemberSheet(false);
      setSearchQuery('');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Could not add member.';
      const errorMessage = Array.isArray(message) ? message[0] : message;

      if (errorMessage.includes('consent')) {
        setConsentError({ show: true });
      } else {
        Toast.show({ type: 'error', text1: 'Failed', text2: errorMessage });
      }
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: number) => communityGroupService.removeMember(documentId!, userId),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Member Removed' });
      void queryClient.invalidateQueries({ queryKey: ['community-group', documentId] });
      setRemoveMemberTarget(null);
      setMemberActionTarget(null);
      setMemberActionLoading(false);
    },
    onError: () => {
      Toast.show({ type: 'error', text1: 'Failed', text2: 'Could not remove this member.' });
      setRemoveMemberTarget(null);
      setMemberActionTarget(null);
      setMemberActionLoading(false);
    },
  });

  const promoteMemberMutation = useMutation({
    mutationFn: (userId: number) => communityGroupService.promoteMember(documentId!, userId),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Member Promoted', text2: 'The member is now an admin.' });
      void queryClient.invalidateQueries({ queryKey: ['community-group', documentId] });
      setMemberActionTarget(null);
      setMemberActionLoading(false);
    },
    onError: () => {
      Toast.show({ type: 'error', text1: 'Failed', text2: 'Could not promote this member.' });
      setMemberActionTarget(null);
      setMemberActionLoading(false);
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: () => communityGroupService.deleteGroup(documentId!),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Group Deleted', text2: 'Community group has been removed.' });
      setDeleteGroupConfirmVisible(false);
      router.replace('/my-community-groups');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Could not delete this group.';
      const errorMessage = Array.isArray(message) ? message[0] : message;
      Toast.show({ type: 'error', text1: 'Failed', text2: errorMessage });
      setDeleteGroupConfirmVisible(false);
    },
  });

  const group = groupQuery.data;
  const isAdmin = group?.members?.some((m) => m.user.id === user?.id && m.role === 'ADMIN');
  const isOwner = group?.creator?.id === user?.id;
  const statusConfig = group ? STATUS_CONFIG[group.status] : null;

  const existingMemberIds = new Set(group?.members?.map((m) => m.user.id) ?? []);

  const resolveAvatar = useCallback((avatar?: string | { url: string; formats?: any } | null) => {
    if (!avatar) return null;
    if (typeof avatar === 'string') return avatar;
    return avatar.url;
  }, []);

  const renderMember = ({ item }: { item: CommunityGroupMember }) => {
    const avatarUrl = resolveAvatar(item.user.userProfile?.avatar);
    const isCreator = item.role === 'ADMIN';
    const canRemove = isAdmin && !isCreator;

    return (
      <Pressable
        onLongPress={() => {
          if (!isAdmin || isCreator) return;
          setMemberActionTarget(item);
        }}
      >
        <HStack className="items-center py-3 px-2" space="md">
          <Box
            className="h-11 w-11 rounded-full items-center justify-center"
            style={{ backgroundColor: `${primaryColor}10` }}
          >
            {avatarUrl ? (
              <Box className="h-11 w-11 rounded-full overflow-hidden">
                <Image source={{ uri: avatarUrl }} style={{ flex: 1 }} contentFit="cover" />
              </Box>
            ) : (
              <IconSymbol name="person.fill" size={20} color={primaryColor} />
            )}
          </Box>

          <VStack className="flex-1" space="xs">
            <Text className="text-sm font-bold" numberOfLines={1} style={{ color: textColor }}>
              {item.user.userProfile?.fullName || item.user.email}
            </Text>
            <HStack className="items-center" space="xs">
              {item.user.userProfile?.city && (
                <Text className="text-xs font-medium" style={{ color: subtextColor }}>
                  {item.user.userProfile.city}
                </Text>
              )}
              {isCreator && (
                <Box
                  className="rounded-full px-2 py-0.5"
                  style={{ backgroundColor: `${primaryColor}14` }}
                >
                  <Text className="text-[9px] font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
                    Admin
                  </Text>
                </Box>
              )}
            </HStack>
          </VStack>

          {canRemove && (
            <Pressable
              onPress={() => setRemoveMemberTarget(item)}
              className="h-9 w-9 rounded-full items-center justify-center"
              style={{ backgroundColor: `${dangerColor}10` }}
            >
              <IconSymbol name="xmark" size={14} color={dangerColor} />
            </Pressable>
          )}
        </HStack>
      </Pressable>
    );
  };

  const renderSearchResult = ({ item }: { item: SearchableUser }) => {
    const alreadyMember = existingMemberIds.has(item.id);
    const searchAvatarUrl = resolveAvatar(item.userProfile?.avatar);

    return (
      <HStack className="items-center py-3 px-2" space="md">
        <Box
          className="h-10 w-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${primaryColor}10` }}
        >
          {searchAvatarUrl ? (
            <Box className="h-10 w-10 rounded-full overflow-hidden">
              <Image source={{ uri: searchAvatarUrl }} style={{ flex: 1 }} contentFit="cover" />
            </Box>
          ) : (
            <IconSymbol name="person.fill" size={18} color={primaryColor} />
          )}
        </Box>

        <VStack className="flex-1" space="xs">
          <Text className="text-sm font-bold" numberOfLines={1} style={{ color: textColor }}>
            {item.userProfile?.fullName || item.username || item.email}
          </Text>
          <Text className="text-xs font-medium" numberOfLines={1} style={{ color: subtextColor }}>
            {item.email}
          </Text>
        </VStack>

        {alreadyMember ? (
          <Box className="rounded-full px-3 py-1.5" style={{ backgroundColor: `${subtextColor}10` }}>
            <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
              Joined
            </Text>
          </Box>
        ) : (
          <Pressable
            className="rounded-full px-3 py-1.5"
            style={{ backgroundColor: primaryColor }}
            onPress={() => addMemberMutation.mutate(item.id)}
            disabled={addMemberMutation.isPending}
          >
            <Text className="text-[10px] font-extrabold uppercase tracking-widest text-white">
              Add
            </Text>
          </Pressable>
        )}
      </HStack>
    );
  };

  if (groupQuery.isLoading) {
    return (
      <Box style={{ flex: 1, backgroundColor }} className="items-center justify-center">
        <Stack.Screen options={{ title: 'Group', headerTitleStyle: { fontWeight: '800' } }} />
        <ActivityIndicator size="large" color={primaryColor} />
      </Box>
    );
  }

  if (!group) {
    return (
      <Box style={{ flex: 1, backgroundColor }} className="items-center justify-center px-6">
        <Stack.Screen options={{ title: 'Group', headerTitleStyle: { fontWeight: '800' } }} />
        <Text className="text-lg font-bold text-center" style={{ color: textColor }}>
          Group not found
        </Text>
      </Box>
    );
  }

  return (
    <Box style={{ flex: 1, backgroundColor }}>
      <Stack.Screen options={{ title: group.name, headerTitleStyle: { fontWeight: '800' } }} />

      <FlatList
        data={group.members}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMember}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <VStack>
            {/* Group Header */}
            <VStack className="px-6 py-8" space="sm">
              <HStack className="items-center" space="sm">
                <Text className="text-3xl font-extrabold flex-1" style={{ color: textColor }}>
                  {group.name}
                </Text>
                {statusConfig && (
                  <Box
                    className="rounded-full px-3 py-1.5 border"
                    style={{
                      backgroundColor: `${statusConfig.color}12`,
                      borderColor: `${statusConfig.color}25`,
                    }}
                  >
                    <Text className="text-[9px] font-extrabold uppercase tracking-widest" style={{ color: statusConfig.color }}>
                      {statusConfig.label}
                    </Text>
                  </Box>
                )}
              </HStack>
              {group.description && (
                <Text className="text-sm font-medium leading-6" style={{ color: subtextColor }}>
                  {group.description}
                </Text>
              )}
            </VStack>

            {/* Stats Card */}
            <Box className="mx-6 rounded-[28px] p-5 border mb-6" style={{ backgroundColor: cardColor, borderColor }}>
              <HStack className="items-center justify-around">
                <VStack className="items-center" space="xs">
                  <Text className="text-2xl font-extrabold" style={{ color: primaryColor }}>
                    {group.members.length}
                  </Text>
                  <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
                    Members
                  </Text>
                </VStack>
                <Box className="h-8 w-px" style={{ backgroundColor: borderColor }} />
                <VStack className="items-center" space="xs">
                  <Text className="text-2xl font-extrabold" style={{ color: primaryColor }}>
                    {group.creator?.userProfile?.fullName?.split(' ')[0] || 'You'}
                  </Text>
                  <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
                    Created by
                  </Text>
                </VStack>
              </HStack>
            </Box>

            {/* Enter Chat Button */}
            {group.status === 'APPROVED' && (
              <Pressable
                className="mx-6 mb-4 h-14 rounded-[22px] items-center justify-center shadow-lg"
                style={{ backgroundColor: primaryColor }}
                onPress={() => router.push(`/community-group-chat/${documentId}`)}
              >
                <HStack className="items-center" space="sm">
                  <IconSymbol name="bubble.left.and.bubble.right.fill" size={18} color="#FFFFFF" />
                  <Text className="text-sm font-extrabold uppercase tracking-widest text-white">
                    Enter Chat Room
                  </Text>
                </HStack>
              </Pressable>
            )}

            {/* Add Member Button */}
            {isAdmin && (
              <Pressable
                className="mx-6 mb-6 h-14 rounded-[22px] items-center justify-center border"
                style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}08` }}
                onPress={() => {
                  setSearchQuery('');
                  setShowAddMemberSheet(true);
                }}
              >
                <HStack className="items-center" space="sm">
                  <IconSymbol name="plus" size={18} color={primaryColor} />
                  <Text className="text-sm font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>
                    Add Member
                  </Text>
                </HStack>
              </Pressable>
            )}

            {isOwner && (
              <Pressable
                className="mx-6 mb-6 h-14 rounded-[22px] items-center justify-center border"
                style={{ borderColor: `${dangerColor}30`, backgroundColor: `${dangerColor}08` }}
                onPress={() => setDeleteGroupConfirmVisible(true)}
              >
                <HStack className="items-center" space="sm">
                  <IconSymbol name="trash.fill" size={18} color={dangerColor} />
                  <Text className="text-sm font-extrabold uppercase tracking-widest" style={{ color: dangerColor }}>
                    Delete Group
                  </Text>
                </HStack>
              </Pressable>
            )}

            {/* Members Section Header */}
            <HStack className="px-6 pb-2 items-center justify-between">
              <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
                Members
              </Text>
            </HStack>
            <Divider className="mx-6 mb-2" style={{ backgroundColor: borderColor }} />
          </VStack>
        }
        ListFooterComponent={
          <VStack className="items-center py-8" space="xs">
            <Divider className="w-12 mb-4" style={{ backgroundColor: borderColor }} />
            <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
              {group.members.length} member{group.members.length !== 1 ? 's' : ''} in this group
            </Text>
          </VStack>
        }
      />

      {/* Add Member Full-Screen Modal (Bottom Sheet style) */}
      <Modal visible={showAddMemberSheet} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: cardColor }} edges={['top', 'left', 'right', 'bottom']}>
          {/* Handle Indicator */}
          <Box className="items-center pt-2 pb-1">
            <Box className="h-1 w-10 rounded-full" style={{ backgroundColor: borderColor }} />
          </Box>

          {/* Header */}
          <HStack className="items-center justify-between px-6 py-4">
            <Text className="text-xl font-extrabold" style={{ color: textColor }}>Add Member</Text>
            <Pressable
              className="h-9 w-9 rounded-full items-center justify-center"
              style={{ backgroundColor: `${subtextColor}10` }}
              onPress={() => {
                setShowAddMemberSheet(false);
                setSearchQuery('');
              }}
            >
              <IconSymbol name="xmark" size={16} color={subtextColor} />
            </Pressable>
          </HStack>

          {/* Search Input */}
          <Box className="px-6 pb-4">
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name or email..."
              placeholderTextColor={subtextColor}
              autoFocus
              style={{
                backgroundColor,
                color: textColor,
                borderColor,
                borderWidth: 1,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                fontWeight: '600',
              }}
            />
          </Box>

          {/* Results */}
          {searchQuery.trim().length < 2 ? (
            <VStack className="items-center py-8" space="sm">
              <IconSymbol name="magnifyingglass" size={28} color={subtextColor} />
              <Text className="text-sm font-medium text-center" style={{ color: subtextColor }}>
                Type at least 2 characters to search
              </Text>
            </VStack>
          ) : searchUsersQuery.isLoading ? (
            <Box className="py-8 items-center">
              <ActivityIndicator size="small" color={primaryColor} />
            </Box>
          ) : !searchUsersQuery.data?.data?.length ? (
            <VStack className="items-center py-8" space="sm">
              <Text className="text-sm font-medium text-center" style={{ color: subtextColor }}>
                No users found
              </Text>
            </VStack>
          ) : (
            <FlatList
              data={searchUsersQuery.data.data}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderSearchResult}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
              ItemSeparatorComponent={() => <Divider style={{ backgroundColor: borderColor }} />}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Remove Member Confirmation */}
      <CustomAlert
        visible={!!removeMemberTarget}
        title="Remove Member?"
        message={`Are you sure you want to remove ${removeMemberTarget?.user?.userProfile?.fullName || 'this user'} from the group?`}
        icon="person.crop.circle.badge.xmark"
        onClose={() => setRemoveMemberTarget(null)}
        primaryButton={{
          text: removeMemberMutation.isPending ? 'Removing...' : 'Remove',
          onPress: () => {
            if (removeMemberTarget) {
              removeMemberMutation.mutate(removeMemberTarget.user.id);
            }
          },
        }}
        secondaryButton={{
          text: 'Cancel',
          onPress: () => setRemoveMemberTarget(null),
        }}
      />

      {/* Member Actions */}
      <CustomAlert
        visible={!!memberActionTarget}
        title="Member Actions"
        message={
          memberActionTarget
            ? `${memberActionTarget.user.userProfile?.fullName || memberActionTarget.user.email}`
            : ''
        }
        icon="gearshape.fill"
        onClose={() => {
          setMemberActionTarget(null);
        }}
        loading={memberActionLoading}
        dismissible={!memberActionLoading}
        primaryButton={{
          text: 'Done',
          onPress: () => {
            setMemberActionTarget(null);
          },
        }}
      >
        <VStack className="w-full" space="sm">
          <Pressable
            className="w-full h-14 rounded-2xl border-2 items-center justify-center px-4"
            style={{ borderColor: `${primaryColor}30`, backgroundColor: `${primaryColor}10` }}
            onPress={() => {
              if (!memberActionTarget) return;
              setMemberActionLoading(true);
              void promoteMemberMutation.mutateAsync(memberActionTarget.user.id).finally(() => {
                setMemberActionLoading(false);
              });
            }}
            disabled={memberActionLoading}
          >
            <HStack className="items-center justify-start w-full" space="sm">
              <IconSymbol name="person.badge.plus.fill" size={16} color={primaryColor} />
              <Text className="flex-1 text-[10px] font-extrabold uppercase tracking-wide" style={{ color: primaryColor }}>
                Promote to Admin
              </Text>
            </HStack>
          </Pressable>

          <Pressable
            className="w-full h-14 rounded-2xl border-2 items-center justify-center px-4"
            style={{ borderColor: `${dangerColor}30`, backgroundColor: `${dangerColor}10` }}
            onPress={() => {
              if (!memberActionTarget) return;
              setMemberActionLoading(true);
              void removeMemberMutation.mutateAsync(memberActionTarget.user.id).finally(() => {
                setMemberActionLoading(false);
              });
            }}
            disabled={memberActionLoading}
          >
            <HStack className="items-center justify-start w-full" space="sm">
              <IconSymbol name="person.crop.circle.badge.xmark" size={16} color={dangerColor} />
              <Text className="flex-1 text-[10px] font-extrabold uppercase tracking-wide" style={{ color: dangerColor }}>
                Remove from Group
              </Text>
            </HStack>
          </Pressable>
        </VStack>
      </CustomAlert>

      <CustomAlert
        visible={deleteGroupConfirmVisible}
        title="Delete Group?"
        message="This will permanently remove the group, all members, and all chat messages."
        icon="trash.fill"
        onClose={() => setDeleteGroupConfirmVisible(false)}
        loading={deleteGroupMutation.isPending}
        dismissible={!deleteGroupMutation.isPending}
        primaryButton={{
          text: deleteGroupMutation.isPending ? 'Deleting...' : 'Delete',
          onPress: () => {
            deleteGroupMutation.mutate();
          },
          style: { backgroundColor: dangerColor },
          icon: 'trash.fill',
        }}
        secondaryButton={{
          text: 'Cancel',
          onPress: () => setDeleteGroupConfirmVisible(false),
          icon: 'xmark',
        }}
      />

      {/* Community Consent Required Alert */}
      <CustomAlert
        visible={consentError.show}
        title="Consent Needed"
        message="This person hasn't enabled community features in their settings yet. To join groups, they need to opt-in to 'Community Visibility'. Please ask them to enable this in their profile settings and try adding them again!"
        icon="hand.raised.fill"
        onClose={() => setConsentError({ show: false })}
        primaryButton={{
          text: "I'll ask them",
          onPress: () => setConsentError({ show: false }),
        }}
      />
    </Box>
  );
}
