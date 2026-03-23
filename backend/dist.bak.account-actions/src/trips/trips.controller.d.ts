import { TripsService } from './trips.service';
import { TripStatus } from '@prisma/client';
export declare class TripsController {
    private readonly tripsService;
    constructor(tripsService: TripsService);
    findAll(page?: string, pageSize?: string, status?: TripStatus, gender?: string, date?: string, creatorId?: string, city?: string): Promise<{
        data: any[];
        meta: import("../common/utils/query.utils").PaginatedMeta;
    }>;
    findByUser(userId: string): Promise<{
        data: ({
            joinRequests: {
                status: import("@prisma/client").$Enums.JoinRequestStatus;
            }[];
            creator: {
                id: number;
                username: string | null;
                email: string;
                userProfile: {
                    avatar: string | null;
                } | null;
            };
        } & {
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
        })[];
    }>;
    findOne(documentId: string): Promise<{
        data: {
            joinRequests: ({
                passenger: {
                    id: number;
                    username: string | null;
                    email: string;
                };
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                message: string | null;
                documentId: string;
                status: import("@prisma/client").$Enums.JoinRequestStatus;
                requestedSeats: number;
                tripId: number;
                passengerId: number;
            })[];
            creator: {
                id: number;
                username: string | null;
                email: string;
                userProfile: {
                    avatar: string | null;
                } | null;
            };
        } & {
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
    }>;
    create(body: {
        data: any;
    }): Promise<{
        data: {
            creator: {
                id: number;
                username: string | null;
                email: string;
                userProfile: {
                    avatar: string | null;
                } | null;
            };
        } & {
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
    }>;
    update(documentId: string, body: {
        data: any;
    }): Promise<{
        data: {
            creator: {
                id: number;
                username: string | null;
                email: string;
                userProfile: {
                    avatar: string | null;
                } | null;
            };
        } & {
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
    }>;
    publish(documentId: string): {
        message: string;
    };
    remove(documentId: string): Promise<{
        data: {
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
    }>;
}
