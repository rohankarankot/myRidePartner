import type { ExpoConfig } from 'expo/config';

const androidAppId =
  process.env.ADMOB_ANDROID_APP_ID || 'ca-app-pub-3940256099942544~3347511713';
const iosAppId =
  process.env.ADMOB_IOS_APP_ID || 'ca-app-pub-3940256099942544~1458002511';
const shareBaseUrl =
  process.env.EXPO_PUBLIC_SHARE_BASE_URL || 'https://my-ride-partner.vercel.app';
const shareHost = new URL(shareBaseUrl).host;

const config: ExpoConfig = {
  name: 'My Ride Partner',
  slug: 'myridepartner',
  version: '2.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'myridepartner',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  runtimeVersion: {
    policy: 'appVersion',
  },
  updates: {
    url: 'https://u.expo.dev/1d2748c6-b89b-46e8-bc81-798e8807cb48',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.rohankarankot.myridepartner',
    googleServicesFile: './GoogleService-Info.plist',
    associatedDomains: [`applinks:${shareHost}`],
    infoPlist: {
      LSApplicationQueriesSchemes: ['whatsapp'],
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#1E3B8A',
      foregroundImage: './assets/images/android-icon-foreground.png',
    },
    edgeToEdgeEnabled: true,
    softwareKeyboardLayoutMode: 'resize',
    predictiveBackGestureEnabled: false,
    package: 'com.rohankarankot.myridepartner',
    versionCode: 1,
    googleServicesFile: './google-services.json',
    permissions: [
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
    ],
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'https',
            host: shareHost,
            pathPrefix: '/trip',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-dev-client',
    '@react-native-firebase/app',
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'static',
        },
      },
    ],
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.jpg',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#1E3B8A',
        dark: {
          backgroundColor: '#0A0F1E',
        },
      },
    ],
    'expo-secure-store',
    '@react-native-google-signin/google-signin',
    '@react-native-community/datetimepicker',
    [
      'expo-notifications',
      {
        icon: './assets/images/android-icon-monochrome.png',
        color: '#3B82F6',
      },
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow My Ride Partner to use your location to help you find your starting point and destination.',
        locationWhenInUsePermission:
          'Allow My Ride Partner to use your location to help you select pickup and drop-off locations.',
      },
    ],
    [
      'react-native-google-mobile-ads',
      {
        androidAppId,
        iosAppId,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: '1d2748c6-b89b-46e8-bc81-798e8807cb48',
    },
  },
  owner: 'rohankarankot',
};

export default {
  ...config,
  'react-native-google-mobile-ads': {
    android_app_id: androidAppId,
    ios_app_id: iosAppId,
  },
};
