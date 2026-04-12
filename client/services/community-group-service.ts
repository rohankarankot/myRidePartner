import apiClient from '@/api/api-client';
import {
    CommunityGroup,
    CommunityGroupDetail,
    PaginatedCommunityGroups,
    PaginatedSearchableUsers,
    CommunityGroupMessage,
    PaginatedCommunityGroupMessages,
} from '@/types/api';

class CommunityGroupService {
    async createGroup(name: string, description?: string): Promise<CommunityGroup> {
        const { data } = await apiClient.post<CommunityGroup>('/community-groups', {
            name,
            description,
        });
        return data;
    }

    async getApprovedGroups(page = 1, pageSize = 20): Promise<PaginatedCommunityGroups> {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('pageSize', String(pageSize));

        const { data } = await apiClient.get<PaginatedCommunityGroups>(
            `/community-groups?${params.toString()}`
        );
        return data;
    }

    async getMyGroups(): Promise<CommunityGroup[]> {
        const { data } = await apiClient.get<CommunityGroup[]>('/community-groups/mine');
        return data;
    }

    async getGroupDetail(documentId: string): Promise<CommunityGroupDetail> {
        const { data } = await apiClient.get<CommunityGroupDetail>(
            `/community-groups/${documentId}`
        );
        return data;
    }

    async addMember(documentId: string, userId: number): Promise<{ message: string }> {
        const { data } = await apiClient.post<{ message: string }>(
            `/community-groups/${documentId}/members`,
            { userId }
        );
        return data;
    }

    async removeMember(documentId: string, userId: number): Promise<{ message: string }> {
        const { data } = await apiClient.delete<{ message: string }>(
            `/community-groups/${documentId}/members/${userId}`
        );
        return data;
    }

    async searchUsers(query: string, page = 1, pageSize = 20): Promise<PaginatedSearchableUsers> {
        const params = new URLSearchParams();
        params.set('q', query);
        params.set('page', String(page));
        params.set('pageSize', String(pageSize));

        const { data } = await apiClient.get<PaginatedSearchableUsers>(
            `/community-groups/search-users?${params.toString()}`
        );
        return data;
    }

    async getMessages(
        documentId: string,
        params?: { cursor?: string | null; limit?: number }
    ): Promise<PaginatedCommunityGroupMessages> {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.set('limit', String(params.limit));
        if (params?.cursor) queryParams.set('cursor', params.cursor);

        const { data } = await apiClient.get<PaginatedCommunityGroupMessages>(
            `/community-groups/${documentId}/messages?${queryParams.toString()}`
        );
        return data;
    }

    async sendMessage(
        documentId: string,
        message: string,
        options?: { replyToDocumentId?: string }
    ): Promise<CommunityGroupMessage> {
        const { data } = await apiClient.post<CommunityGroupMessage>(
            `/community-groups/${documentId}/messages`,
            {
                message,
                replyToDocumentId: options?.replyToDocumentId,
            }
        );
        return data;
    }
}

export const communityGroupService = new CommunityGroupService();
