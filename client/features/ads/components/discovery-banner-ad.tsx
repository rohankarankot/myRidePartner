import { Platform, StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const ANDROID_BANNER_UNIT_ID =
  process.env.EXPO_PUBLIC_ADMOB_DISCOVERY_BANNER_ANDROID || TestIds.BANNER;
const IOS_BANNER_UNIT_ID =
  process.env.EXPO_PUBLIC_ADMOB_DISCOVERY_BANNER_IOS || TestIds.BANNER;

function getBannerUnitId() {
  if (Platform.OS === 'android') {
    return ANDROID_BANNER_UNIT_ID;
  }

  if (Platform.OS === 'ios') {
    return IOS_BANNER_UNIT_ID;
  }

  return null;
}

export function DiscoveryBannerAd() {
  const unitId = getBannerUnitId();

  if (!unitId || Platform.OS === 'web') {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
    marginBottom: 20,
    alignItems: 'center',
  },
});
