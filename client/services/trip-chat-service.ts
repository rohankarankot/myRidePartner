import apiClient from '../api/api-client';
import { PaginatedTripChatMessages, TripChat, TripChatMessage } from '../types/api';

class TripChatService {
    async getChatAccess(tripDocumentId: string): Promise<TripChat> {
        const { data } = await apiClient.get<TripChat>(`/trips/${tripDocumentId}/chat`);
        return data;
    }

    async getMessages(tripDocumentId: string, options?: { cursor?: string | null; limit?: number }): Promise<PaginatedTripChatMessages> {
        const params = new URLSearchParams();
        if (options?.cursor) {
            params.set('cursor', options.cursor);
        }
        if (options?.limit) {
            params.set('limit', String(options.limit));
        }

        const query = params.toString();
        const { data } = await apiClient.get<PaginatedTripChatMessages>(
            `/trips/${tripDocumentId}/chat/messages${query ? `?${query}` : ''}`
        );
        return data;
    }

    async sendMessage(tripDocumentId: string, message: string): Promise<TripChatMessage> {
        const { data } = await apiClient.post<TripChatMessage>(`/trips/${tripDocumentId}/chat/messages`, {
            message,
        });
        return data;
    }
}

export const tripChatService = new TripChatService();
