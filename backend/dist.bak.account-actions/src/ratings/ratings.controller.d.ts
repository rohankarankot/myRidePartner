import { RatingsService } from './ratings.service';
export declare class RatingsController {
    private readonly ratingsService;
    constructor(ratingsService: RatingsService);
    create(body: {
        stars: number;
        comment?: string;
        trip: string;
        rater: number;
        ratee: number;
    }): Promise<{
        data: {
            trip: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                city: string | null;
                description: string | null;
                documentId: string;
                startingPoint: string;
                destination: string;
                date: string;
                time: string;
                availableSeats: number;
                pricePerSeat: import("@prisma/client-runtime-utils").Decimal | null;
                isPriceCalculated: boolean;
                genderPreference: import("@prisma/client").$Enums.GenderPreference;
                status: import("@prisma/client").$Enums.TripStatus;
                creatorId: number;
            };
            rater: {
                id: number;
                username: string | null;
                email: string;
            };
            ratee: {
                id: number;
                username: string | null;
                email: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            documentId: string;
            tripId: number;
            stars: number;
            comment: string | null;
            raterId: number;
            rateeId: number;
        };
    }>;
    getRatingsByUser(userId: string, page?: string, pageSize?: string): Promise<{
        data: ({
            trip: {
                id: number;
                documentId: string;
                startingPoint: string;
                destination: string;
                date: string;
            };
            rater: {
                id: number;
                username: string | null;
                userProfile: {
                    fullName: string | null;
                    avatar: string | null;
                } | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            documentId: string;
            tripId: number;
            stars: number;
            comment: string | null;
            raterId: number;
            rateeId: number;
        })[];
        meta: import("../common/utils/query.utils").PaginatedMeta;
    }>;
    getRatingForTripByUser(tripDocumentId: string, userId: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        documentId: string;
        tripId: number;
        stars: number;
        comment: string | null;
        raterId: number;
        rateeId: number;
    } | null>;
}
