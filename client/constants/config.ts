import { Platform } from 'react-native';

export const CONFIG = {
    API_URL: process.env.EXPO_PUBLIC_API_URL ||
        (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000'),
    SHARE_BASE_URL: process.env.EXPO_PUBLIC_SHARE_BASE_URL || 'https://my-ride-partner.vercel.app',
    GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
    OLA_MAPS_API_KEY: process.env.EXPO_PUBLIC_OLA_MAPS_API_KEY || '',
    OLA_MAPS_PROJECT_ID: process.env.EXPO_PUBLIC_OLA_MAPS_PROJECT_ID || '',
    OLA_MAPS_CLIENT_ID: process.env.EXPO_PUBLIC_OLA_MAPS_CLIENT_ID || '',
    SUPPORT_EMAIL: 'rohan.alwayscodes@gmail.com',
};
