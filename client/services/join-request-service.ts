import apiClient from '../api/api-client';
import { JoinRequest, JoinRequestStatus } from '../types/api';

class JoinRequestService {
    async createJoinRequest(data: {
        trip: string; // documentId
        passenger: number; // userId
        requestedSeats: number;
        message?: string;
    }): Promise<JoinRequest> {
        const { data: response } = await apiClient.post<JoinRequest>('/api/join-requests', data);
        return response;
    }

    async getJoinRequestsForTrip(tripDocumentId: string): Promise<JoinRequest[]> {
        const { data } = await apiClient.get<JoinRequest[]>(
            `/api/join-requests?tripDocumentId=${tripDocumentId}`
        );
        return data;
    }

    async updateJoinRequestStatus(documentId: string, status: JoinRequestStatus): Promise<JoinRequest> {
        const { data } = await apiClient.put<JoinRequest>(
            `/api/join-requests/${documentId}/status`,
            { status }
        );
        return data;
    }

    async deleteJoinRequest(documentId: string): Promise<void> {
        await apiClient.delete(`/api/join-requests/${documentId}`);
    }

    async getPendingRequestsForCaptain(userId: number): Promise<JoinRequest[]> {
        const { data } = await apiClient.get<JoinRequest[]>(
            `/api/join-requests/pending/${userId}`
        );
        return data;
    }

    async getJoinRequestByDocumentId(documentId: string): Promise<JoinRequest> {
        const { data } = await apiClient.get<JoinRequest>(
            `/api/join-requests/${documentId}`
        );
        return data;
    }
}

export const joinRequestService = new JoinRequestService();
