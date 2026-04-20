import { useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

const DEFAULT_AD_UNIT_ID = Platform.select({
  android: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID || TestIds.INTERSTITIAL,
  ios: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS || TestIds.INTERSTITIAL,
}) || TestIds.INTERSTITIAL;

const DEFAULT_FREQUENCY = 2; // Show every 2nd time

export function useInterstitialAd(frequency = DEFAULT_FREQUENCY, customAdUnitId?: string) {
  const [interstitial, setInterstitial] = useState<InterstitialAd | null>(null);
  const [loaded, setLoaded] = useState(false);
  const clickCount = useRef(0);

  const adUnitIdToUse = __DEV__
    ? TestIds.INTERSTITIAL
    : (customAdUnitId || DEFAULT_AD_UNIT_ID);

  const loadAd = useCallback(() => {
    const newAd = InterstitialAd.createForAdRequest(adUnitIdToUse, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubscribeLoaded = newAd.addAdEventListener(AdEventType.LOADED, () => {
      setLoaded(true);
    });

    const unsubscribeClosed = newAd.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      loadAd(); // Pre-load the next ad
    });

    const unsubscribeError = newAd.addAdEventListener(AdEventType.ERROR, (error: Error) => {
      console.warn('AdMob Interstitial Error:', error);
      setLoaded(false);
    });

    newAd.load();
    setInterstitial(newAd);

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, [adUnitIdToUse]);

  useEffect(() => {
    const cleanup = loadAd();
    return cleanup;
  }, [loadAd]);

  const showAdWithCallback = useCallback((callback: () => void) => {
    clickCount.current += 1;

    // Only show ad every X times
    if (clickCount.current % frequency === 0 && loaded && interstitial) {
      const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        callback();
        unsubscribeClosed();
      });
      interstitial.show();
    } else {
      // Skip ad and just do the callback
      callback();
    }
  }, [frequency, loaded, interstitial]);

  return { showAdWithCallback, loaded };
}
