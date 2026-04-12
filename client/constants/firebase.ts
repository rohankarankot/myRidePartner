const firebaseWebConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
};

export const FIREBASE_WEB_CONFIG = firebaseWebConfig;

export function hasFirebaseWebConfig() {
  return Boolean(
    firebaseWebConfig.apiKey &&
      firebaseWebConfig.appId &&
      firebaseWebConfig.messagingSenderId &&
      firebaseWebConfig.projectId,
  );
}
