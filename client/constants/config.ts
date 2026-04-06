import { Platform } from 'react-native';

export const CONFIG = {
    API_URL: process.env.EXPO_PUBLIC_API_URL ||
        (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000'),
    SHARE_BASE_URL: process.env.EXPO_PUBLIC_SHARE_BASE_URL || 'https://myridepartner.in',
    GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
    SUPPORT_EMAIL: 'rohan.alwayscodes@gmail.com',
};
