import apiClient from '../api/api-client';
import { Rating } from '../types/api';

class RatingService {
    async createRating(ratingData: {
        stars: number;
        comment?: string;
        trip: string; // documentId
        rater: number; // userId
        ratee: number; // userId
    }): Promise<Rating> {
        const { data } = await apiClient.post<{ data: Rating }>('/ratings', ratingData);
        return data.data;
    }

    async getRatingsByUser(userId: number, page = 1, pageSize = 10) {
        const { data } = await apiClient.get<{ data: any[]; meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } } }>(
            `/ratings/user/${userId}?page=${page}&pageSize=${pageSize}`
        );
        return data;
    }

    async getRatingForTripByUser(tripDocumentId: string, userId: number): Promise<Rating | null> {
        const { data } = await apiClient.get<Rating | null>(
            `/ratings/trip/${tripDocumentId}/user/${userId}`
        );
        return data;
    }
}

export const ratingService = new RatingService();
