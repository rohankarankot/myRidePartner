import { PrismaService } from '../prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { Prisma, TripStatus, GenderPreference } from '@prisma/client';
import { PaginationParams, PaginatedMeta } from '../common/utils/query.utils';
import { TripChatsService } from '../trip-chats/trip-chats.service';
export interface TripFilters {
    status?: TripStatus;
    genderPreference?: GenderPreference;
    date?: string;
    creatorId?: number;
    city?: string;
}
export declare class TripsService {
    private readonly prisma;
    private readonly eventsGateway;
    private readonly notificationsService;
    private readonly tripChatsService;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway, notificationsService: NotificationsService, tripChatsService: TripChatsService);
    findAll(pagination: PaginationParams, filters?: TripFilters): Promise<{
        data: any[];
        meta: PaginatedMeta;
    }>;
    findByDocumentId(documentId: string): Promise<{
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
            pricePerSeat: Prisma.Decimal | null;
            isPriceCalculated: boolean;
            genderPreference: import("@prisma/client").$Enums.GenderPreference;
            status: import("@prisma/client").$Enums.TripStatus;
            creatorId: number;
        };
    }>;
    findByCreatorId(userId: number): Promise<{
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
            pricePerSeat: Prisma.Decimal | null;
            isPriceCalculated: boolean;
            genderPreference: import("@prisma/client").$Enums.GenderPreference;
            status: import("@prisma/client").$Enums.TripStatus;
            creatorId: number;
        })[];
    }>;
    create(data: {
        description?: string;
        startingPoint: string;
        destination: string;
        date: string;
        time: string;
        availableSeats: number;
        city?: string;
        pricePerSeat?: number;
        isPriceCalculated: boolean;
        genderPreference: string;
        creator: number;
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
            pricePerSeat: Prisma.Decimal | null;
            isPriceCalculated: boolean;
            genderPreference: import("@prisma/client").$Enums.GenderPreference;
            status: import("@prisma/client").$Enums.TripStatus;
            creatorId: number;
        };
    }>;
    update(documentId: string, data: Prisma.TripUpdateInput): Promise<{
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
            pricePerSeat: Prisma.Decimal | null;
            isPriceCalculated: boolean;
            genderPreference: import("@prisma/client").$Enums.GenderPreference;
            status: import("@prisma/client").$Enums.TripStatus;
            creatorId: number;
        };
    }>;
    private incrementCompletedTripsStats;
    private notifyPassengersOfStatusChange;
    delete(documentId: string): Promise<{
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
            pricePerSeat: Prisma.Decimal | null;
            isPriceCalculated: boolean;
            genderPreference: import("@prisma/client").$Enums.GenderPreference;
            status: import("@prisma/client").$Enums.TripStatus;
            creatorId: number;
        };
    }>;
}
