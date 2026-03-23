import { EventsGateway } from '../events/events.gateway';
import { PrismaService } from '../prisma.service';
import { JoinRequestStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
export declare class JoinRequestsService {
    private readonly prisma;
    private readonly eventsGateway;
    private readonly notificationsService;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway, notificationsService: NotificationsService);
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
    findPendingForCaptain(captainId: number): Promise<({
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
    findByPassenger(passengerId: number): Promise<({
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
    findByDocumentId(documentId: string): Promise<{
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
    create(data: {
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
    updateStatus(documentId: string, status: JoinRequestStatus): Promise<{
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
