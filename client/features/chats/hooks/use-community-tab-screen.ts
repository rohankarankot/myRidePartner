import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { authQueryKeys } from '@/features/auth/query-keys';
import {
  getStoredCommunityConsent,
  persistCommunityConsent,
} from '@/features/chats/storage/community-consent';
import { userService } from '@/services/user-service';
import { logger } from '@/shared/lib/logger';
import { useUserStore } from '@/store/user-store';

export function useCommunityTabScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { profile, setProfile } = useUserStore();
  const [showConsentPrompt, setShowConsentPrompt] = useState(false);
  const [isCheckingConsent, setIsCheckingConsent] = useState(true);
  const [isSavingConsent, setIsSavingConsent] = useState(false);

  const { data: communityData, isLoading } = useQuery({
    queryKey: ['community-members-count'],
    queryFn: () => userService.getCommunityMembers({ pageSize: 1 }),
    enabled: !isCheckingConsent && !showConsentPrompt && !!user,
  });

  const totalMembers = communityData?.meta?.pagination?.total || 0;

  const syncConsentState = useCallback(async () => {
    setIsCheckingConsent(true);

    try {
      if (!user) {
        setShowConsentPrompt(false);
        return;
      }

      const storedConsent = await getStoredCommunityConsent(user.id);
      if (storedConsent) {
        setShowConsentPrompt(false);
        return;
      }

      if (profile?.communityConsent) {
        await persistCommunityConsent(user.id);
        setShowConsentPrompt(false);
        return;
      }

      setShowConsentPrompt(true);
    } catch (error) {
      logger.error('Failed to resolve community consent state', { error });
      setShowConsentPrompt(true);
    } finally {
      setIsCheckingConsent(false);
    }
  }, [profile?.communityConsent, user]);

  useFocusEffect(
    useCallback(() => {
      void syncConsentState();
    }, [syncConsentState])
  );

  const handleAcceptConsent = useCallback(async () => {
    if (!user) {
      return;
    }

    setIsSavingConsent(true);

    try {
      const activeProfile = profile ?? await userService.getUserProfile(user.id);

      if (!activeProfile) {
        setShowConsentPrompt(false);
        router.replace({ pathname: '/(tabs)/profile', params: { openEditor: 'true' } });
        return;
      }

      const updatedProfile = await userService.updateProfile(activeProfile.documentId, {
        communityConsent: true,
      });

      setProfile(updatedProfile);
      await persistCommunityConsent(user.id);
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.userProfile(user.id) });
      await queryClient.invalidateQueries({ queryKey: ['community-members-count'] });
      setShowConsentPrompt(false);
    } catch (error) {
      logger.error('Failed to save community consent', { error, userId: user.id });
    } finally {
      setIsSavingConsent(false);
      setIsCheckingConsent(false);
    }
  }, [profile, queryClient, router, setProfile, user]);

  const handleDeclineConsent = useCallback(() => {
    setShowConsentPrompt(false);
    setIsCheckingConsent(false);
    router.replace('/');
  }, [router]);

  return {
    isLoading,
    isCheckingConsent,
    isSavingConsent,
    showConsentPrompt,
    handleAcceptConsent,
    handleDeclineConsent,
    router,
    totalMembers,
  };
}
