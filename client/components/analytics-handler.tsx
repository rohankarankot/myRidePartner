import { useEffect, useRef } from 'react';
import { usePathname } from 'expo-router';

import { useAuth } from '@/features/auth/auth-context';
import { analyticsService } from '@/services/analytics-service';
import { useUserStore } from '@/store/user-store';

export function AnalyticsHandler() {
  const pathname = usePathname();
  const { user } = useAuth();
  const profile = useUserStore((state) => state.profile);
  const lastTrackedPathRef = useRef<string | null>(null);
  const hasTrackedProfileCompletedRef = useRef(false);

  useEffect(() => {
    void analyticsService.initialize();
  }, []);

  useEffect(() => {
    if (!pathname || lastTrackedPathRef.current === pathname) {
      return;
    }

    lastTrackedPathRef.current = pathname;
    void analyticsService.trackScreen(pathname);
  }, [pathname]);

  useEffect(() => {
    void analyticsService.setUser(user?.id ?? null);
  }, [user?.id]);

  useEffect(() => {
    void analyticsService.setUserProperty('auth_state', user ? 'signed_in' : 'signed_out');
  }, [user]);

  useEffect(() => {
    const isProfileComplete = Boolean(
      profile?.fullName && profile?.phoneNumber && profile?.gender && profile?.city,
    );

    void analyticsService.setUserProperty('profile_complete', isProfileComplete ? 'true' : 'false');
    void analyticsService.setUserProperty('city', profile?.city ?? null);
    void analyticsService.setUserProperty(
      'organization_verified',
      profile?.isOrganizationVerified ? 'true' : 'false',
    );

    if (isProfileComplete && !hasTrackedProfileCompletedRef.current) {
      hasTrackedProfileCompletedRef.current = true;
      void analyticsService.trackEvent('profile_completed', {
        city: profile?.city ?? undefined,
        organization_verified: Boolean(profile?.isOrganizationVerified),
      });
    }

    if (!isProfileComplete) {
      hasTrackedProfileCompletedRef.current = false;
    }
  }, [
    profile?.city,
    profile?.fullName,
    profile?.gender,
    profile?.isOrganizationVerified,
    profile?.phoneNumber,
  ]);

  return null;
}
