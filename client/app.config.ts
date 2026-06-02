import type { ExpoConfig } from 'expo/config';
import withVerificationToken from './plugins/withVerificationToken';

const androidAppId =
  process.env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID || 'ca-app-pub-4316956546209623~6592915428';
const iosAppId =
  process.env.EXPO_PUBLIC_ADMOB_APP_ID_IOS || 'ca-app-pub-3940256099942544~1458002511';
const shareBaseUrl =
  process.env.EXPO_PUBLIC_SHARE_BASE_URL || 'https://cab-collab.vercel.app';
const shareHost = new URL(shareBaseUrl).host;

const config: ExpoConfig = {
  name: 'Cab Collab',
  slug: 'myridepartner',
  version: '3.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'cabcollab',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  runtimeVersion: {
    policy: 'appVersion',
  },
  updates: {
    url: 'https://u.expo.dev/227dc62a-7e36-4a43-8bae-723aa73b7805',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.rohanalwayscodes.myridepartner',
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
    package: 'com.rohanalwayscodes.myridepartner',
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
        android: {
          enableProguardInReleaseBuilds: true,
          enableShrinkResourcesInReleaseBuilds: true,
          extraProguardRules: `
# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# React Native / JSI runtime helpers
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.fabric.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.swmansion.worklets.** { *; }

# Firebase + notifications
-keep class com.google.firebase.** { *; }
-keep class io.invertase.firebase.** { *; }
-keep class app.notifee.core.** { *; }

# Ads SDK
-keep class com.google.android.gms.ads.** { *; }
-keep class com.google.ads.** { *; }
`,
        },
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
          'Allow Cab Collab to use your location to help you find your starting point and destination.',
        locationWhenInUsePermission:
          'Allow Cab Collab to use your location to help you select pickup and drop-off locations.',
      },
    ],
    [
      'react-native-google-mobile-ads',
      {
        androidAppId,
        iosAppId,
      },
    ],
    ...(process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT
      ? ['@sentry/react-native/expo']
      : []),
    withVerificationToken as any,
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: '227dc62a-7e36-4a43-8bae-723aa73b7805',
    },
    router: {},
  },
  owner: 'rohanalwayscodes',
};

export default {
  ...config,
  'react-native-google-mobile-ads': {
    android_app_id: androidAppId,
    ios_app_id: iosAppId,
  },
};
