import apiClient from '@/api/api-client';
import { AuthResponse } from '@/types/api';

class AuthService {
    async googleLogin(accessToken: string): Promise<AuthResponse> {
        const { data } = await apiClient.get<AuthResponse>(
            `/api/auth/google/callback?access_token=${accessToken}`
        );
        return data;
    }
}

export const authService = new AuthService();
