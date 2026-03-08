import apiClient from '../api/api-client';
import { Trip, SingleTripResponse, TripResponse } from '../types/api';

class TripService {
    async createTrip(tripData: {
        startingPoint: string;
        destination: string;
        date: string;
        time: string;
        availableSeats: number;
        pricePerSeat?: number;
        isPriceCalculated: boolean;
        genderPreference: string;
        creator: number;
    }): Promise<Trip> {
        const { data } = await apiClient.post<SingleTripResponse>('/api/trips', {
            data: tripData
        });
        return data.data;
    }

    async getTrips(page: number = 1, pageSize: number = 10, filters?: { gender?: string, date?: string }): Promise<TripResponse> {
        let filterQuery = '&filters[status][$ne]=COMPLETED&filters[status][$ne]=CANCELLED';

        if (filters?.gender && filters.gender !== 'both') {
            filterQuery += `&filters[genderPreference][$eq]=${filters.gender}`;
        }
        if (filters?.date) {
            filterQuery += `&filters[date][$eq]=${filters.date}`;
        }

        const { data } = await apiClient.get<TripResponse>(
            `/api/trips?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}${filterQuery}`
        );
        return data;
    }

    async getUserTrips(userId: number): Promise<Trip[]> {
        const { data } = await apiClient.get<{ data: Trip[] }>(`/api/trips?filters[creator][id][$eq]=${userId}&populate=*`);
        return data.data;
    }

    async updateTripStatus(documentId: string, status: string): Promise<Trip> {
        const { data } = await apiClient.put<SingleTripResponse>(`/api/trips/${documentId}`, {
            data: { status }
        });
        return data.data;
    }
    async deleteTrip(documentId: string): Promise<Trip> {
        const { data } = await apiClient.delete<SingleTripResponse>(`/api/trips/${documentId}`);
        return data.data;
    }

    async getTripById(documentId: string): Promise<Trip> {
        const { data } = await apiClient.get<SingleTripResponse>(`/api/trips/${documentId}?populate=*`);
        return data.data;
    }
}

export const tripService = new TripService();
