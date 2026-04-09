import apiClient from '@/api/api-client';
import { Trip, TripResponse } from '@/types/api';

export interface GetTripsFilters {
  gender?: string;
  date?: string;
  city?: string;
  fromQuery?: string;
  toQuery?: string;
}

export interface CreateTripInput {
  description?: string;
  startingPoint: string;
  destination: string;
  date: string;
  time: string;
  availableSeats: number;
  pricePerSeat?: number | null;
  isPriceCalculated: boolean;
  genderPreference: string;
  creator: number;
  city?: string;
}

export interface UpdateTripInput {
  description?: string;
  startingPoint: string;
  destination: string;
  date: string;
  time: string;
  availableSeats: number;
  pricePerSeat?: number | null;
  isPriceCalculated: boolean;
  genderPreference: string;
  city?: string;
}

class TripService {
  async createTrip(tripData: CreateTripInput): Promise<Trip> {
    const { data } = await apiClient.post<{ data: Trip }>('/trips', {
      data: tripData,
    });
    return data.data;
  }

  async updateTrip(documentId: string, tripData: UpdateTripInput): Promise<Trip> {
    const { data } = await apiClient.put<{ data: Trip }>(`/trips/${documentId}`, {
      data: tripData,
    });
    return data.data;
  }

  async getTrips(page = 1, pageSize = 10, filters?: GetTripsFilters): Promise<TripResponse> {
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
    if (filters?.city) {
      params.set('city', filters.city);
    }
    if (filters?.fromQuery?.trim()) {
      params.set('fromQuery', filters.fromQuery.trim());
    }
    if (filters?.toQuery?.trim()) {
      params.set('toQuery', filters.toQuery.trim());
    }

    const { data } = await apiClient.get<TripResponse>(`/trips?${params.toString()}`);
    return data;
  }

  async getUserTrips(userId: number): Promise<Trip[]> {
    const { data } = await apiClient.get<{ data: Trip[] }>(`/trips/user/${userId}`);
    return data.data;
  }

  async updateTripStatus(
    documentId: string,
    payload: { status: string; pricePerSeat?: number },
  ): Promise<Trip> {
    const { data } = await apiClient.put<{ data: Trip }>(`/trips/${documentId}`, {
      data: payload,
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
