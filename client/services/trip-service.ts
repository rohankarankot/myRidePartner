import apiClient from '../api/api-client';
import { Trip, TripResponse, TripStatus } from '../types/api';

class TripService {
    async createTrip(tripData: {
        description?: string;
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
        const { data } = await apiClient.post<{ data: Trip }>('/trips', {
            data: tripData
        });
        return data.data;
    }

    async getTrips(page: number = 1, pageSize: number = 10, filters?: { gender?: string, date?: string }): Promise<TripResponse> {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('pageSize', String(pageSize));
        params.set('status', 'PUBLISHED');

        if (filters?.gender && filters.gender !== 'both') {
            params.set('gender', filters.gender);
        }
        if (filters?.date) {
            params.set('date', filters.date);
        }

        const { data } = await apiClient.get<TripResponse>(`/trips?${params.toString()}`);
        return data;
    }

    async getUserTrips(userId: number): Promise<Trip[]> {
        const { data } = await apiClient.get<{ data: Trip[] }>(`/trips/user/${userId}`);
        return data.data;
    }

    async updateTripStatus(documentId: string, status: string): Promise<Trip> {
        const { data } = await apiClient.put<{ data: Trip }>(`/trips/${documentId}`, {
            data: { status }
        });
        return data.data;
    }

    async deleteTrip(documentId: string): Promise<Trip> {
        const { data } = await apiClient.delete<{ data: Trip }>(`/trips/${documentId}`);
        return data.data;
    }

    async getTripById(documentId: string): Promise<Trip> {
        const { data } = await apiClient.get<{ data: Trip }>(`/trips/${documentId}`);
        return data.data;
    }
}

export const tripService = new TripService();
