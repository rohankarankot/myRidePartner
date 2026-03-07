import { Platform } from 'react-native';

export const CONFIG = {
    STRAPI_URL: process.env.EXPO_PUBLIC_STRAPI_URL ||
        (Platform.OS === 'android' ? 'http://10.0.2.2:1337' : 'http://localhost:1337'),
    GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
};
