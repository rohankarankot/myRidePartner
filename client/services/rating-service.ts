import apiClient from '../api/api-client';
import { Rating, SingleRatingResponse, RatingResponse } from '../types/api';

class RatingService {
    async createRating(ratingData: {
        stars: number;
        comment?: string;
        trip: string; // documentId
        rater: number; // userId
        ratee: number; // userId
    }): Promise<Rating> {
        const { data } = await apiClient.post<SingleRatingResponse>('/api/ratings', {
            data: ratingData
        });
        return data.data;
    }

    async getRatingForTripByUser(tripId: string, userId: number): Promise<Rating | null> {
        const { data } = await apiClient.get<RatingResponse>(
            `/api/ratings?filters[trip][documentId][$eq]=${tripId}&filters[rater][id][$eq]=${userId}&populate=*`
        );
        return data.data.length > 0 ? data.data[0] : null;
    }

    async getRatingsForUser(userId: number): Promise<Rating[]> {
        const { data } = await apiClient.get<RatingResponse>(
            `/api/ratings?filters[ratee][id][$eq]=${userId}&populate=*`
        );
        return data.data;
    }
}

export const ratingService = new RatingService();
