import { JoinRequestsService } from './join-requests.service';
export declare class JoinRequestsController {
    private readonly joinRequestsService;
    constructor(joinRequestsService: JoinRequestsService);
    findByTrip(tripDocumentId: string): Promise<({
        trip: {
            creator: {
                id: number;
                username: string | null;
                email: string;
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
    })[]>;
    findPendingForCaptain(captainId: string): Promise<({
        trip: {
            creator: {
                id: number;
                username: string | null;
                email: string;
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
    })[]>;
    findByPassenger(userId: string): Promise<({
        trip: {
            joinRequests: {
                status: import("@prisma/client").$Enums.JoinRequestStatus;
            }[];
            creator: {
                id: number;
                username: string | null;
                email: string;
                userProfile: {
                    fullName: string | null;
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
    })[]>;
    findOne(documentId: string): Promise<{
        trip: {
            creator: {
                id: number;
                username: string | null;
                email: string;
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
    }>;
    create(body: {
        trip: string;
        passenger: number;
        requestedSeats: number;
        message?: string;
    }): Promise<{
        trip: {
            creator: {
                id: number;
                username: string | null;
                email: string;
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
    }>;
    updateStatus(documentId: string, body: {
        status: string;
    }): Promise<{
        trip: {
            creator: {
                id: number;
                username: string | null;
                email: string;
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
    }>;
}
