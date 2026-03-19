import apiClient from '@/api/api-client';
import { User, UserProfile, UserProfileResponse } from '@/types/api';

class UserService {
    async getCurrentUser(): Promise<User> {
        const { data } = await apiClient.get<User>('/users/me');
        return data;
    }

    async getUserProfile(userId: number): Promise<UserProfile | null> {
        try {
            const { data } = await apiClient.get<UserProfile>(`/user-profiles/user/${userId}`);
            data.documentId = String(data.id);
            return data;
        } catch (error: any) {
            if (error.response?.status === 404) return null;
            throw error;
        }
    }

    async createProfile(profileData: {
        fullName: string;
        phoneNumber: string;
        gender: 'men' | 'women';
        userId: number;
    }): Promise<UserProfile> {
        const { data } = await apiClient.post<UserProfile>('/user-profiles', profileData);
        data.documentId = String(data.id);
        return data;
    }

    async updateProfile(documentId: string, profileData: {
        fullName?: string;
        phoneNumber?: string;
        gender?: 'men' | 'women';
        avatar?: number | string;
        pushToken?: string;
    }): Promise<UserProfile> {
        const { data } = await apiClient.patch<UserProfile>(`/user-profiles/${documentId}`, profileData);
        data.documentId = String(data.id);
        return data;
    }

    async updatePushToken(documentId: string, pushToken: string): Promise<UserProfile> {
        return this.updateProfile(documentId, { pushToken });
    }

    async uploadFile(fileUri: string): Promise<string> {
        const formData = new FormData();
        const filename = fileUri.split('/').pop() || `avatar-${Date.now()}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const ext = match ? match[1].toLowerCase() : 'jpg';
        const type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

        formData.append('files', {
            uri: fileUri,
            name: filename,
            type: type,
        } as any);

        const { data } = await apiClient.post<any[]>('/upload', formData, {
            transformRequest: (data) => data, // Prevent axios from transforming FormData
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });

        return data[0].id;
    }
}

export const userService = new UserService();
