import apiClient from '../api/api-client';
import { PaginatedPublicChatMessages, PublicChatMessage } from '../types/api';

class PublicChatService {
    async getMessages(options?: { cursor?: string | null; limit?: number }): Promise<PaginatedPublicChatMessages> {
        const params = new URLSearchParams();
        if (options?.cursor) {
            params.set('cursor', options.cursor);
        }
        if (options?.limit) {
            params.set('limit', String(options.limit));
        }

        const query = params.toString();
        const { data } = await apiClient.get<PaginatedPublicChatMessages>(
            `/public-chat/messages${query ? `?${query}` : ''}`
        );
        return data;
    }

    async sendMessage(
        message: string,
        options?: { replyToDocumentId?: string }
    ): Promise<PublicChatMessage> {
        const { data } = await apiClient.post<PublicChatMessage>('/public-chat/messages', {
            message,
            replyToDocumentId: options?.replyToDocumentId,
        });
        return data;
    }
}

export const publicChatService = new PublicChatService();
