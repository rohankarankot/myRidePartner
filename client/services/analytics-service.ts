import { Platform } from 'react-native';
import {
  getAnalytics,
  logEvent,
  setAnalyticsCollectionEnabled,
  setUserId,
  setUserProperty,
  type Analytics,
} from '@react-native-firebase/analytics';
import { getApp, getApps, initializeApp } from '@react-native-firebase/app';

import { FIREBASE_WEB_CONFIG, hasFirebaseWebConfig } from '@/constants/firebase';
import { logger } from '@/shared/lib/logger';

type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

class AnalyticsService {
  private initializePromise: Promise<boolean> | null = null;
  private analyticsInstance: Analytics | null = null;

  initialize() {
    if (!this.initializePromise) {
      this.initializePromise = this.initializeInternal();
    }

    return this.initializePromise;
  }

  private async initializeInternal() {
    try {
      if (Platform.OS === 'web') {
        if (getApps().length === 0) {
          if (!hasFirebaseWebConfig()) {
            logger.warn('Firebase web config is missing. Web analytics will stay disabled.');
            return false;
          }

          initializeApp(FIREBASE_WEB_CONFIG);
        }

        this.analyticsInstance = getAnalytics(getApp());
      } else {
        this.analyticsInstance = getAnalytics();
      }

      await setAnalyticsCollectionEnabled(this.analyticsInstance, true);
      return true;
    } catch (error) {
      logger.error('Failed to initialize analytics', { error });
      this.analyticsInstance = null;
      return false;
    }
  }

  async trackScreen(pathname: string) {
    const isReady = await this.initialize();
    if (!isReady) {
      return;
    }

    const screenName = this.normalizeRouteName(pathname);

    try {
      await logEvent(this.analyticsInstance!, 'screen_view', {
        screen_class: screenName,
        screen_name: screenName,
      });
    } catch (error) {
      logger.error('Failed to track screen view', { error, pathname });
    }
  }

  async trackEvent(name: string, params?: AnalyticsParams) {
    const isReady = await this.initialize();
    if (!isReady) {
      return;
    }

    try {
      await logEvent(this.analyticsInstance!, name, params);
    } catch (error) {
      logger.error('Failed to track analytics event', { error, name, params });
    }
  }

  async setUser(userId: number | string | null) {
    const isReady = await this.initialize();
    if (!isReady) {
      return;
    }

    try {
      await setUserId(this.analyticsInstance!, userId ? String(userId) : null);
    } catch (error) {
      logger.error('Failed to set analytics user', { error, userId });
    }
  }

  async setUserProperty(name: string, value: string | null) {
    const isReady = await this.initialize();
    if (!isReady) {
      return;
    }

    try {
      await setUserProperty(this.analyticsInstance!, name, value);
    } catch (error) {
      logger.error('Failed to set analytics user property', { error, name, value });
    }
  }

  private normalizeRouteName(pathname: string) {
    const trimmed = pathname.replace(/^\/+|\/+$/g, '');

    return trimmed ? trimmed.replace(/\//g, '_') : 'home';
  }
}

export const analyticsService = new AnalyticsService();
