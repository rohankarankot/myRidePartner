import React, { useMemo, useState } from 'react';
import { Modal, ScrollView, Switch } from 'react-native';
import { Stack } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import { useAuth } from '@/context/auth-context';
import { authQueryKeys } from '@/features/auth/query-keys';
import {
  clearStoredCommunityConsent,
  persistCommunityConsent,
} from '@/features/chats/storage/community-consent';
import { useThemeColor } from '@/hooks/use-theme-color';
import { userService } from '@/services/user-service';
import { useUserStore } from '@/store/user-store';
import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export default function CommunitySettingsScreen() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { profile, setProfile } = useUserStore();

  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');
  const dangerColor = '#DC2626';
  const overlayColor = 'rgba(7, 10, 18, 0.56)';

  const { data: resolvedProfile } = useQuery({
    queryKey: authQueryKeys.userProfile(user?.id),
    queryFn: async () => {
      if (!user) {
        return null;
      }

      const latestProfile = await userService.getUserProfile(user.id);
      if (latestProfile) {
        setProfile(latestProfile);
      }
      return latestProfile;
    },
    enabled: !!user && !profile,
    initialData: profile,
  });

  const activeProfile = profile ?? resolvedProfile ?? null;
  const isCommunityEnabled = Boolean(activeProfile?.communityConsent);

  const consentSummary = useMemo(
    () =>
      isCommunityEnabled
        ? 'You are visible in the community and can join the shared space.'
        : 'You are opted out. Turn this on if you want to appear in the community again.',
    [isCommunityEnabled]
  );

  const updateConsentMutation = useMutation({
    mutationFn: async (nextValue: boolean) => {
      if (!user) {
        throw new Error('Missing authenticated user');
      }

      const latestProfile = activeProfile ?? await userService.getUserProfile(user.id);

      if (!latestProfile) {
        throw new Error('Missing user profile');
      }

      const updatedProfile = await userService.updateProfile(latestProfile.documentId, {
        communityConsent: nextValue,
      });

      if (nextValue) {
        await persistCommunityConsent(user.id);
      } else {
        await clearStoredCommunityConsent(user.id);
      }

      return updatedProfile;
    },
    onMutate: async (nextValue: boolean) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: authQueryKeys.userProfile(user?.id) });

      // Snapshot the previous profile for rollback
      const previousProfile = activeProfile;

      // Optimistically update local state immediately
      if (activeProfile) {
        const optimistic = { ...activeProfile, communityConsent: nextValue };
        setProfile(optimistic);
        queryClient.setQueryData(authQueryKeys.userProfile(user?.id), optimistic);
      }

      return { previousProfile };
    },
    onSuccess: async (updatedProfile) => {
      if (!user) {
        return;
      }

      // Sync with the actual server response
      queryClient.setQueryData(authQueryKeys.userProfile(user.id), updatedProfile);
      setProfile(updatedProfile);

      // Only invalidate member lists, not the profile (already set above)
      await queryClient.invalidateQueries({ queryKey: ['community-members-count'] });
      await queryClient.invalidateQueries({ queryKey: ['community-members'] });
      Toast.show({
        type: 'success',
        text1: updatedProfile.communityConsent ? 'Community enabled' : 'Community disabled',
        text2: updatedProfile.communityConsent
          ? 'You have opted in to the community.'
          : 'You have opted out of the community.',
      });
    },
    onError: (_error, _nextValue, context) => {
      // Rollback to previous state on failure
      if (context?.previousProfile && user) {
        setProfile(context.previousProfile);
        queryClient.setQueryData(authQueryKeys.userProfile(user.id), context.previousProfile);
      }
      Toast.show({
        type: 'error',
        text1: 'Update failed',
        text2: 'We could not update your community preference right now.',
      });
    },
  });

  const handleToggle = (nextValue: boolean) => {
    if (updateConsentMutation.isPending || !user) {
      return;
    }

    if (!nextValue) {
      // Disabling → show confirmation modal
      setHasAcknowledged(false);
      setShowDisableConfirm(true);
      return;
    }

    // Enabling → proceed directly
    void updateConsentMutation.mutateAsync(nextValue);
  };

  const handleConfirmDisable = () => {
    setShowDisableConfirm(false);
    setHasAcknowledged(false);
    void updateConsentMutation.mutateAsync(false);
  };

  const handleCancelDisable = () => {
    setShowDisableConfirm(false);
    setHasAcknowledged(false);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor }} contentContainerStyle={{ paddingBottom: 40 }}>
      <Stack.Screen options={{ title: 'Community Settings', headerTitleStyle: { fontWeight: '800' } }} />

      <VStack className="px-6 py-8" space="xs">
        <Text className="text-3xl font-extrabold" style={{ color: textColor }}>Community Settings</Text>
        <Text className="text-sm font-medium" style={{ color: subtextColor }}>
          Manage whether you want to opt in to the public community experience.
        </Text>
      </VStack>

      <Box className="mx-6 rounded-[32px] p-6 mb-6 border" style={{ backgroundColor: cardColor, borderColor }}>
        <HStack className="items-start justify-between" space="md">
          <VStack className="flex-1 pr-3" space="sm">
            <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
              Consent
            </Text>
            <Text className="text-xl font-extrabold" style={{ color: textColor }}>
              Community visibility
            </Text>
            <Text className="text-sm font-medium leading-6" style={{ color: subtextColor }}>
              {consentSummary}
            </Text>
          </VStack>
          <Switch
            value={isCommunityEnabled}
            onValueChange={handleToggle}
            disabled={updateConsentMutation.isPending || !activeProfile}
            trackColor={{ false: borderColor, true: primaryColor }}
            thumbColor="#ffffff"
          />
        </HStack>
      </Box>

      <VStack space="md" className="px-6">
        <Box className="rounded-[28px] p-5 border" style={{ backgroundColor: cardColor, borderColor }}>
          <HStack space="md" className="items-start">
            <Box
              className="h-10 w-10 rounded-full items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <IconSymbol name="person.3.fill" size={18} color="#fff" />
            </Box>
            <VStack className="flex-1" space="xs">
              <Text className="text-base font-bold" style={{ color: textColor }}>
                What opting in means
              </Text>
              <Text className="text-sm font-medium leading-6" style={{ color: subtextColor }}>
                Other users can see your name and city in the community and interact with you there.
              </Text>
            </VStack>
          </HStack>
        </Box>

        <Box className="rounded-[28px] p-5 border" style={{ backgroundColor: cardColor, borderColor }}>
          <HStack space="md" className="items-start">
            <Box
              className="h-10 w-10 rounded-full items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <IconSymbol name="hand.raised.fill" size={18} color="#fff" />
            </Box>
            <VStack className="flex-1" space="xs">
              <Text className="text-base font-bold" style={{ color: textColor }}>
                What opting out means
              </Text>
              <Text className="text-sm font-medium leading-6" style={{ color: subtextColor }}>
                You will no longer appear as part of the public community until you opt in again.
              </Text>
            </VStack>
          </HStack>
        </Box>
      </VStack>

      <VStack className="items-center py-12" space="xs">
        <Divider className="w-12 mb-4" style={{ backgroundColor: borderColor }} />
        <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: subtextColor }}>
          {updateConsentMutation.isPending ? 'Saving your preference' : 'You can change this anytime'}
        </Text>
      </VStack>

      {/* ── Disable Confirmation Modal ── */}
      <Modal visible={showDisableConfirm} transparent animationType="fade">
        <Box className="flex-1 justify-end px-5 pb-6" style={{ backgroundColor: overlayColor }}>
          <Box
            className="rounded-[34px] border px-6 pb-6 pt-5 shadow-2xl"
            style={{ backgroundColor: cardColor, borderColor: `${dangerColor}25` }}
          >
            {/* Header */}
            <HStack className="items-center justify-between mb-5">
              <Box
                className="h-16 w-16 rounded-[24px] items-center justify-center"
                style={{ backgroundColor: `${dangerColor}12` }}
              >
                <IconSymbol name="exclamationmark.triangle.fill" size={28} color={dangerColor} />
              </Box>
              <Box
                className="rounded-full px-3 py-2 border"
                style={{ backgroundColor: `${dangerColor}12`, borderColor: `${dangerColor}25` }}
              >
                <Text className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: dangerColor }}>
                  Irreversible
                </Text>
              </Box>
            </HStack>

            {/* Title & Description */}
            <VStack space="sm">
              <Text className="text-3xl font-extrabold" style={{ color: textColor }}>
                Leave Community?
              </Text>
              <Text className="text-sm leading-6 font-medium" style={{ color: subtextColor }}>
                Turning this off will remove you from all communities you are a part of. Please read the following carefully.
              </Text>
            </VStack>

            {/* Warning details */}
            <VStack className="mt-5 rounded-[28px] border p-4" space="md" style={{ borderColor, backgroundColor }}>
              <HStack className="items-start" space="md">
                <Box className="h-9 w-9 rounded-full items-center justify-center" style={{ backgroundColor: `${dangerColor}14` }}>
                  <IconSymbol name="trash.fill" size={16} color={dangerColor} />
                </Box>
                <VStack className="flex-1" space="xs">
                  <Text className="text-sm font-bold" style={{ color: textColor }}>
                    Messages deleted permanently
                  </Text>
                  <Text className="text-xs leading-5 font-medium" style={{ color: subtextColor }}>
                    All messages you have sent in any community chat will be permanently deleted and cannot be recovered.
                  </Text>
                </VStack>
              </HStack>

              <HStack className="items-start" space="md">
                <Box className="h-9 w-9 rounded-full items-center justify-center" style={{ backgroundColor: `${dangerColor}14` }}>
                  <IconSymbol name="person.2.slash.fill" size={15} color={dangerColor} />
                </Box>
                <VStack className="flex-1" space="xs">
                  <Text className="text-sm font-bold" style={{ color: textColor }}>
                    Removed from all communities
                  </Text>
                  <Text className="text-xs leading-5 font-medium" style={{ color: subtextColor }}>
                    You will be removed from every community you have joined. You can rejoin later by opting back in.
                  </Text>
                </VStack>
              </HStack>
            </VStack>

            {/* Checkbox acknowledgement */}
            <Pressable
              className="mt-5"
              onPress={() => setHasAcknowledged((prev) => !prev)}
            >
              <HStack className="items-center" space="md">
                <Box
                  className="h-7 w-7 rounded-lg border-2 items-center justify-center"
                  style={{
                    borderColor: hasAcknowledged ? dangerColor : borderColor,
                    backgroundColor: hasAcknowledged ? dangerColor : 'transparent',
                  }}
                >
                  {hasAcknowledged && (
                    <IconSymbol name="checkmark" size={16} color="#fff" />
                  )}
                </Box>
                <Text className="flex-1 text-sm font-bold" style={{ color: textColor }}>
                  I understand that my messages will be permanently deleted and I will be removed from all communities.
                </Text>
              </HStack>
            </Pressable>

            {/* Action buttons */}
            <VStack className="mt-6" space="sm">
              <Pressable
                className="h-14 rounded-[22px] items-center justify-center"
                style={{
                  backgroundColor: dangerColor,
                  opacity: hasAcknowledged ? 1 : 0.35,
                }}
                disabled={!hasAcknowledged}
                onPress={handleConfirmDisable}
              >
                <Text className="text-sm font-extrabold uppercase tracking-widest text-white">
                  Leave Community
                </Text>
              </Pressable>

              <Pressable
                className="h-14 rounded-[22px] border items-center justify-center"
                style={{ borderColor }}
                onPress={handleCancelDisable}
              >
                <Text className="text-sm font-bold" style={{ color: textColor }}>
                  Cancel
                </Text>
              </Pressable>
            </VStack>
          </Box>
        </Box>
      </Modal>
    </ScrollView>
  );
}
