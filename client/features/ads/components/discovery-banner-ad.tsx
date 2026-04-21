import React from 'react';
import { Platform, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const AD_UNIT_ID = Platform.select({
  android: process.env.EXPO_PUBLIC_ADMOB_DISCOVERY_BANNER_ANDROID || TestIds.BANNER,
  ios: process.env.EXPO_PUBLIC_ADMOB_DISCOVERY_BANNER_IOS || TestIds.BANNER,
}) || TestIds.BANNER;

export function DiscoveryBannerAd() {
  const unitId = __DEV__ ? TestIds.BANNER : AD_UNIT_ID;

  if (!unitId) return null;

  return (
    <View style={{ alignItems: 'center', marginVertical: 10 }}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}
