import apiClient from '../api/api-client';
import { JoinRequest, JoinRequestStatus } from '../types/api';

class JoinRequestService {
    async createJoinRequest(data: {
        trip: string; // documentId
        passenger: number; // userId
        requestedSeats: number;
        message?: string;
        sharePhoneNumber: boolean;
    }): Promise<JoinRequest> {
        const { data: response } = await apiClient.post<JoinRequest>('/join-requests', data);
        return response;
    }

    async getJoinRequestsForUser(userId: number): Promise<JoinRequest[]> {
        const { data } = await apiClient.get<JoinRequest[]>(
            `/join-requests/user/${userId}`
        );
        return data;
    }

    async getJoinRequestsForTrip(tripDocumentId: string): Promise<JoinRequest[]> {
        const { data } = await apiClient.get<JoinRequest[]>(
            `/join-requests?tripDocumentId=${tripDocumentId}`
        );
        return data;
    }

    async updateJoinRequestStatus(documentId: string, status: JoinRequestStatus): Promise<JoinRequest> {
        const { data } = await apiClient.put<JoinRequest>(
            `/join-requests/${documentId}/status`,
            { status }
        );
        return data;
    }

    async updatePickupStatus(documentId: string, hasArrived: boolean): Promise<JoinRequest> {
        const { data } = await apiClient.put<JoinRequest>(
            `/join-requests/${documentId}/pickup-status`,
            { hasArrived }
        );
        return data;
    }

    async deleteJoinRequest(documentId: string): Promise<void> {
        await apiClient.delete(`/join-requests/${documentId}`);
    }

    async getPendingRequestsForCaptain(userId: number): Promise<JoinRequest[]> {
        const { data } = await apiClient.get<JoinRequest[]>(
            `/join-requests/pending/${userId}`
        );
        return data;
    }

    async getJoinRequestByDocumentId(documentId: string): Promise<JoinRequest> {
        const { data } = await apiClient.get<JoinRequest>(
            `/join-requests/${documentId}`
        );
        return data;
    }
}

export const joinRequestService = new JoinRequestService();
