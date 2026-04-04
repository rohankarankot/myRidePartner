import apiClient from '../api/api-client';
import { PaginatedPublicChatMessages, PublicChatMessage } from '../types/api';

class PublicChatService {
    async getMessages(options?: { cursor?: string | null; limit?: number; city?: string | null }): Promise<PaginatedPublicChatMessages> {
        const params = new URLSearchParams();
        if (options?.cursor) {
            params.set('cursor', options.cursor);
        }
        if (options?.limit) {
            params.set('limit', String(options.limit));
        }
        if (options?.city) {
            params.set('city', options.city);
        }

        const query = params.toString();
        const { data } = await apiClient.get<PaginatedPublicChatMessages>(
            `/public-chat/messages${query ? `?${query}` : ''}`
        );
        return data;
    }

    async sendMessage(
        message: string,
        options?: { replyToDocumentId?: string; city?: string | null }
    ): Promise<PublicChatMessage> {
        const { data } = await apiClient.post<PublicChatMessage>('/public-chat/messages', {
            message,
            city: options?.city,
            replyToDocumentId: options?.replyToDocumentId,
        });
        return data;
    }
}

export const publicChatService = new PublicChatService();
