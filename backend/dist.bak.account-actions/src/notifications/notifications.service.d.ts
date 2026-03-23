import { PrismaService } from '../prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { ExpoPushService } from './expo-push.service';
import { NotificationType } from '@prisma/client';
import { PaginationParams, PaginatedMeta } from '../common/utils/query.utils';
export interface NotificationFilters {
    userId?: number;
    read?: boolean;
}
export declare class NotificationsService {
    private readonly prisma;
    private readonly eventsGateway;
    private readonly expoPushService;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway, expoPushService: ExpoPushService);
    findAll(pagination: PaginationParams, filters?: NotificationFilters): Promise<{
        data: any[];
        meta: PaginatedMeta;
    }>;
    getUnreadCount(userId: number): Promise<number>;
    create(data: {
        title: string;
        message: string;
        type: NotificationType;
        userId: number;
        data?: any;
        relatedId?: string;
    }): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        data: import("@prisma/client/runtime/client").JsonValue | null;
        type: import("@prisma/client").$Enums.NotificationType;
        userId: number;
        title: string;
        message: string;
        documentId: string;
        read: boolean;
        relatedId: string | null;
    }>;
    sendPushOnly(data: {
        title: string;
        message: string;
        userId: number;
        data?: any;
    }): Promise<void>;
    markAsRead(documentId: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        data: import("@prisma/client/runtime/client").JsonValue | null;
        type: import("@prisma/client").$Enums.NotificationType;
        userId: number;
        title: string;
        message: string;
        documentId: string;
        read: boolean;
        relatedId: string | null;
    }>;
    markAllAsRead(userId: number): Promise<{
        message: string;
    }>;
    delete(documentId: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        data: import("@prisma/client/runtime/client").JsonValue | null;
        type: import("@prisma/client").$Enums.NotificationType;
        userId: number;
        title: string;
        message: string;
        documentId: string;
        read: boolean;
        relatedId: string | null;
    }>;
    deleteAll(userId: number): Promise<{
        message: string;
    }>;
}
