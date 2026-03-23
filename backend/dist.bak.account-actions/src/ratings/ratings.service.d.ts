import { PrismaService } from '../prisma.service';
import { PaginationParams } from '../common/utils/query.utils';
export declare class RatingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: {
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
    getRatingForTripByUser(tripDocumentId: string, userId: number): Promise<{
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
    getRatingsByUser(userId: number, pagination: PaginationParams): Promise<{
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
    private updateRateeProfile;
}
