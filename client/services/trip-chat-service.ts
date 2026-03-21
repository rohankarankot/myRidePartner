import apiClient from '../api/api-client';
import { TripChat, TripChatMessage } from '../types/api';

class TripChatService {
    async getChatAccess(tripDocumentId: string): Promise<TripChat> {
        const { data } = await apiClient.get<TripChat>(`/trips/${tripDocumentId}/chat`);
        return data;
    }

    async getMessages(tripDocumentId: string): Promise<TripChatMessage[]> {
        const { data } = await apiClient.get<TripChatMessage[]>(`/trips/${tripDocumentId}/chat/messages`);
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
