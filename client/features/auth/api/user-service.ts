import apiClient from '@/api/api-client';
import { CommunityMemberCitiesResponse, PaginatedCommunityMembers, User, UserAnalytics, UserProfile } from '@/types/api';

class UserService {
  async getCurrentUser(): Promise<User> {
    const { data } = await apiClient.get<User>('/users/me');
    return data;
  }

  async pauseMyAccount(): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>('/users/me/account/pause');
    return data;
  }

  async deleteMyAccount(): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>('/users/me');
    return data;
  }

  async getMyAnalytics(): Promise<UserAnalytics> {
    const { data } = await apiClient.get<{ data: UserAnalytics }>('/users/me/analytics');
    return data.data;
  }

  async getBlockedUserIds(): Promise<number[]> {
    const { data } = await apiClient.get<{ data: number[] }>('/users/me/blocks');
    return data.data;
  }

  async getCommunityMembers(options?: { page?: number; pageSize?: number; city?: string }): Promise<PaginatedCommunityMembers> {
    const params = new URLSearchParams();
    if (options?.page) {
      params.set('page', String(options.page));
    }
    if (options?.pageSize) {
      params.set('pageSize', String(options.pageSize));
    }
    if (options?.city) {
      params.set('city', options.city);
    }

    const query = params.toString();
    const { data } = await apiClient.get<PaginatedCommunityMembers>(
      `/users/community-members${query ? `?${query}` : ''}`
    );
    return data;
  }

  async getCommunityMemberCities(): Promise<string[]> {
    const { data } = await apiClient.get<CommunityMemberCitiesResponse>('/users/community-members/cities');
    return data.data;
  }

  async blockUser(userId: number): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(`/users/me/blocks/${userId}`);
    return data;
  }

  async unblockUser(userId: number): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(`/users/me/blocks/${userId}`);
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
    city: string;
    userId: number;
  }): Promise<UserProfile> {
    const { data } = await apiClient.post<UserProfile>('/user-profiles', profileData);
    data.documentId = String(data.id);
    return data;
  }

  async updateProfile(
    documentId: string,
    profileData: {
      fullName?: string;
      phoneNumber?: string;
      gender?: 'men' | 'women';
      city?: string;
      avatar?: number | string;
      governmentIdDocument?: string;
      aadhaarNumber?: string;
      governmentIdVerified?: boolean;
      isVerified?: boolean;
      communityConsent?: boolean;
      pushToken?: string;
    }
  ): Promise<UserProfile> {
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

    formData.append(
      'files',
      {
        uri: fileUri,
        name: filename,
        type,
      } as any
    );

    const { data } = await apiClient.post<any[]>('/upload', formData, {
      transformRequest: (requestData) => requestData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data[0].id;
  }
}

export const userService = new UserService();
