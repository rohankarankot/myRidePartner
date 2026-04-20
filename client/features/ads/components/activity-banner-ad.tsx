import React from 'react';
import { Platform, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const AD_UNIT_ID = Platform.select({
  android: process.env.EXPO_PUBLIC_ADMOB_ACTIVITY_BANNER_ANDROID || TestIds.BANNER,
  ios: process.env.EXPO_PUBLIC_ADMOB_ACTIVITY_BANNER_IOS || TestIds.BANNER,
}) || TestIds.BANNER;

export function ActivityBannerAd() {
  if (!AD_UNIT_ID) return null;

  return (
    <View style={{ alignItems: 'center', marginBottom: 10 }}>
      <BannerAd
        unitId={AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}
