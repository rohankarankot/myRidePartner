import apiClient from '@/api/api-client';
import { AuthResponse } from '@/types/api';

class AuthService {
    async googleLogin(idToken: string): Promise<AuthResponse> {
        const { data } = await apiClient.post<AuthResponse>('/auth/google', {
            token: idToken
        });
        return data;
    }
}

export const authService = new AuthService();
