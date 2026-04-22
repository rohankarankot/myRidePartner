import mobileAds from 'react-native-google-mobile-ads';

export function initializeMobileAds() {
  return mobileAds()
    .initialize()
    .then((adapterStatuses) => {
      console.log('AdMob SDK Initialized:', adapterStatuses);
    });
}
