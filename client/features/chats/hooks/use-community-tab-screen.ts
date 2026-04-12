import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import { useAuth } from '@/context/auth-context';
import { authQueryKeys } from '@/features/auth/query-keys';
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

      const latestProfile = profile ?? await userService.getUserProfile(user.id);

      if (latestProfile) {
        setProfile(latestProfile);
      }

      if (latestProfile?.communityConsent) {
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
  }, [profile, setProfile, user]);

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

      queryClient.setQueryData(authQueryKeys.userProfile(user.id), updatedProfile);
      setProfile(updatedProfile);
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.userProfile(user.id) });
      await queryClient.invalidateQueries({ queryKey: ['community-members-count'] });
      setShowConsentPrompt(false);
      Toast.show({
        type: 'success',
        text1: 'Community access enabled',
        text2: 'Your consent has been saved.',
      });
    } catch (error) {
      logger.error('Failed to save community consent', { error, userId: user.id });
      Toast.show({
        type: 'error',
        text1: 'Could not save consent',
        text2: 'Please check your connection and try again.',
      });
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
