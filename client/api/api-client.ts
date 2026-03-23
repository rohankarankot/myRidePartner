import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { CONFIG } from '@/constants/config';
import { logger } from '@/shared/lib/logger';

const apiClient = axios.create({
    baseURL: `${CONFIG.API_URL}/api`,
});

apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            logger.error('Error reading token from SecureStore', { error });
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.data) {
            logger.warn('API Error', {
                message: error.response.data.error?.message || error.response.data,
            });
        }
        if (error.response?.status === 401) {
            logger.warn('Unauthorized request detected (401)');
            await SecureStore.deleteItemAsync('userToken');
            await SecureStore.deleteItemAsync('userData');
        }
        return Promise.reject(error);
    }
);

export default apiClient;
