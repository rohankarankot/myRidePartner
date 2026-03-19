export interface User {
    id: number;
    documentId: string;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
}

export interface AuthResponse {
    jwt?: string;
    access_token?: string;
    user: User;
}

export interface ApiError {
    message: string;
    status: number;
}

export interface Media {
    id: number;
    url: string;
    formats?: any;
}

export interface UserProfile {
    id: number;
    documentId: string;
    fullName: string;
    phoneNumber: string;
    rating?: number;
    completedTripsCount?: number;
    ratingsCount?: number;
    isVerified?: boolean;
    userId?: User;
    avatar?: Media | string;
    gender?: 'men' | 'women';
    pushToken?: string;
}

export interface UserProfileResponse {
    data: UserProfile[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

export type GenderPreference = 'men' | 'women' | 'both';

export type TripStatus = 'PUBLISHED' | 'STARTED' | 'COMPLETED' | 'CANCELLED';

export interface Trip {
    id: number;
    documentId: string;
    description?: string;
    startingPoint: string;
    destination: string;
    date: string;
    time: string;
    availableSeats: number;
    pricePerSeat?: number;
    isPriceCalculated: boolean;
    genderPreference: GenderPreference;
    status: TripStatus;
    creator?: User;
    joinRequests?: JoinRequest[];
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
}

export interface TripResponse {
    data: Trip[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

export interface SingleTripResponse {
    data: Trip;
}

export type JoinRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface JoinRequest {
    id: number;
    documentId: string;
    trip: Trip;
    passenger: User;
    status: JoinRequestStatus;
    requestedSeats: number;
    message?: string;
    createdAt: string;
    updatedAt: string;
}

export interface JoinRequestResponse {
    data: JoinRequest[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

export interface SingleJoinRequestResponse {
    data: JoinRequest;
}

export type NotificationType = 'JOIN_REQUEST' | 'TRIP_UPDATE' | 'SYSTEM' | 'TRIP_COMPLETED';

export interface Notification {
    id: number;
    documentId: string;
    title: string;
    message: string;
    type: NotificationType;
    read: boolean;
    user: User;
    data?: any;
    relatedId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationResponse {
    data: Notification[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

export interface SingleNotificationResponse {
    data: Notification;
}

export interface Rating {
    id: number;
    documentId: string;
    stars: number;
    comment?: string;
    trip?: Trip;
    rater?: User;
    ratee?: User;
    createdAt: string;
    updatedAt: string;
}

export interface RatingResponse {
    data: Rating[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

export interface SingleRatingResponse {
    data: Rating;
}

