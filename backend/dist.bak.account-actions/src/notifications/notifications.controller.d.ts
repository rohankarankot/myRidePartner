import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(userId?: string, read?: string, page?: string, pageSize?: string): Promise<{
        data: any[];
        meta: import("../common/utils/query.utils").PaginatedMeta;
    }>;
    sendTestNotification(body: {
        userId: number;
        title?: string;
        message?: string;
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
    getUnreadCount(userId: string): Promise<number>;
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
    markAllAsRead(userId: string): Promise<{
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
    deleteAll(userId: string): Promise<{
        message: string;
    }>;
}
