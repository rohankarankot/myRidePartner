import { useEffect, useRef } from 'react';
import { usePathname } from 'expo-router';

import { useAuth } from '@/features/auth/auth-context';
import { analyticsService } from '@/services/analytics-service';

export function AnalyticsHandler() {
  const pathname = usePathname();
  const { user } = useAuth();
  const lastTrackedPathRef = useRef<string | null>(null);

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

  return null;
}
