export interface User {
    id: number;
    documentId: string;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    accountStatus?: 'ACTIVE' | 'PAUSED';
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    userProfile?: {
        fullName?: string;
        phoneNumber?: string;
        city?: string;
        avatar?: string | { url: string; formats?: any };
    };
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
    governmentIdVerified?: boolean;
    communityConsent?: boolean;
    governmentIdDocument?: string;
    aadhaarNumber?: string;
    userId: number;
    user?: User;
    avatar?: Media | string;
    gender?: 'men' | 'women';
    city?: string;
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

export interface UserAnalyticsSummary {
    ridesPosted: number;
    requestsApproved: number;
    ridesCompleted: number;
    completionRate: number;
    estimatedMoneySaved: number;
    estimatedCostRecovered: number;
}

export interface UserAnalyticsMonth {
    key: string;
    label: string;
    ridesPosted: number;
    requestsApproved: number;
    ridesCompleted: number;
    moneySaved: number;
    costRecovered: number;
}

export interface UserAnalytics {
    summary: UserAnalyticsSummary;
    monthlyActivity: UserAnalyticsMonth[];
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
    sharePhoneNumber: boolean;
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

export interface TripChat {
    tripDocumentId: string;
    canAccess: boolean;
    tripStatus: TripStatus;
    isCaptain: boolean;
}

export interface TripChatMessage {
    id: number;
    documentId: string;
    message: string;
    sender: User & {
        userProfile?: {
            avatar?: string | { url: string; formats?: any };
            fullName?: string;
        } | null;
    };
    createdAt: string;
    replyTo?: {
        documentId: string;
        message: string;
        createdAt: string;
        sender: User & {
            userProfile?: {
                avatar?: string | { url: string; formats?: any };
                fullName?: string;
            } | null;
        };
    } | null;
}

export interface PaginatedTripChatMessages {
    messages: TripChatMessage[];
    hasMore: boolean;
    nextCursor: string | null;
}

export interface PublicChatMessage {
    id: number;
    documentId: string;
    message: string;
    city?: string | null;
    sender: User & {
        userProfile?: {
            avatar?: string | { url: string; formats?: any };
            fullName?: string;
        } | null;
    };
    createdAt: string;
    replyTo?: {
        documentId: string;
        message: string;
        createdAt: string;
        sender: User & {
            userProfile?: {
                avatar?: string | { url: string; formats?: any };
                fullName?: string;
            } | null;
        };
    } | null;
}

export interface PaginatedPublicChatMessages {
    messages: PublicChatMessage[];
    hasMore: boolean;
    nextCursor: string | null;
    city?: string | null;
}

export interface CommunityMember {
    id: number;
    username?: string;
    email: string;
    userProfile?: {
        fullName?: string;
        city?: string;
        avatar?: string | { url: string; formats?: any };
    } | null;
}

export interface PaginatedCommunityMembers {
    data: CommunityMember[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

export interface CommunityMemberCitiesResponse {
    data: string[];
}

export type CommunityGroupStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type CommunityGroupRole = 'ADMIN' | 'MEMBER';

export interface CommunityGroup {
    id: number;
    documentId: string;
    name: string;
    description?: string;
    status: CommunityGroupStatus;
    memberCount?: number;
    creator?: User;
    createdAt: string;
    updatedAt: string;
}

export interface CommunityGroupMember {
    id: number;
    role: CommunityGroupRole;
    user: CommunityMember;
    createdAt: string;
}

export interface CommunityGroupDetail extends CommunityGroup {
    members: CommunityGroupMember[];
}

export interface SearchableUser {
    id: number;
    username?: string;
    email: string;
    userProfile?: {
        fullName?: string;
        avatar?: string | { url: string; formats?: any };
    } | null;
}

export interface PaginatedCommunityGroups {
    data: CommunityGroup[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

export interface PaginatedSearchableUsers {
    data: SearchableUser[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

export interface CommunityGroupMessage {
    id: number;
    documentId: string;
    message: string;
    sender: User & {
        userProfile?: {
            avatar?: string | { url: string; formats?: any };
            fullName?: string;
        } | null;
    };
    createdAt: string;
    replyTo?: {
        documentId: string;
        message: string;
        createdAt: string;
        sender: User & {
            userProfile?: {
                avatar?: string | { url: string; formats?: any };
                fullName?: string;
            } | null;
        };
    } | null;
}

export interface PaginatedCommunityGroupMessages {
    messages: CommunityGroupMessage[];
    hasMore: boolean;
    nextCursor: string | null;
}
