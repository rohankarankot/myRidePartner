import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { CONFIG } from '@/constants/config';

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
            console.error('Error reading token from SecureStore', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.data) {
            console.warn('API Error:', error.response.data.error?.message || error.response.data);
        }
        if (error.response?.status === 401) {
            // Global 401 handling: Clear token and redirect to login if necessary
            // For now, we'll just log it. In a full implementation, you'd call signOut()
            console.warn('Unauthorized request detected (401)');
            await SecureStore.deleteItemAsync('userToken');
            await SecureStore.deleteItemAsync('userData');
        }
        return Promise.reject(error);
    }
);

export default apiClient;
