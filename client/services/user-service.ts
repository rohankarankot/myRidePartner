import apiClient from '@/api/api-client';
import { User, UserProfile, UserProfileResponse } from '@/types/api';

class UserService {
    async getCurrentUser(): Promise<User> {
        const { data } = await apiClient.get<User>('/api/users/me');
        return data;
    }

    async getUserProfile(userId: number): Promise<UserProfile | null> {
        // Fetch profile specifically for this userId
        const { data } = await apiClient.get<UserProfileResponse>(
            `/api/user-profiles?filters[userId][id][$eq]=${userId}&populate=userId&populate=avatar`
        );

        return data.data.length > 0 ? data.data[0] : null;
    }

    async createProfile(profileData: {
        fullName: string;
        phoneNumber: string;
        gender: 'men' | 'women';
        userId: number;
    }): Promise<UserProfile> {
        const { data } = await apiClient.post<{ data: UserProfile }>('/api/user-profiles?populate=avatar', {
            data: {
                ...profileData,
                publishedAt: new Date()
            }
        });
        return data.data;
    }

    async updateProfile(documentId: string, profileData: {
        fullName?: string;
        phoneNumber?: string;
        gender?: 'men' | 'women';
        avatar?: number;
        pushToken?: string;
    }): Promise<UserProfile> {
        const { data } = await apiClient.put<{ data: UserProfile }>(`/api/user-profiles/${documentId}?populate=avatar`, {
            data: profileData
        });
        return data.data;
    }

    async updatePushToken(documentId: string, pushToken: string): Promise<UserProfile> {
        return this.updateProfile(documentId, { pushToken });
    }

    async uploadFile(fileUri: string): Promise<number> {
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

        const { data } = await apiClient.post<any[]>('/api/upload', formData, {
            transformRequest: (data) => data, // Prevent axios from transforming FormData
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });

        return data[0].id;
    }
}

export const userService = new UserService();
