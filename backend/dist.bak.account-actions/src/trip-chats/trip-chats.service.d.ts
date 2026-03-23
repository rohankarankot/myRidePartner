import { PrismaService } from '../prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { GetTripChatMessagesQueryDto } from './dto/trip-chats.dto';
export declare class TripChatsService {
    private readonly prisma;
    private readonly eventsGateway;
    private readonly notificationsService;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway, notificationsService: NotificationsService);
    getChatAccess(tripDocumentId: string, userId: number): Promise<{
        tripDocumentId: string;
        canAccess: boolean;
        tripStatus: import("@prisma/client").$Enums.TripStatus;
        isCaptain: boolean;
    }>;
    getMessages(tripDocumentId: string, userId: number, query?: GetTripChatMessagesQueryDto): Promise<{
        messages: {
            id: number;
            documentId: string;
            message: string;
            createdAt: Date;
            sender: {
                id: number;
                username: string | null;
                email: string;
                userProfile: {
                    fullName: string | null;
                    avatar: string | null;
                } | null;
            };
        }[];
        hasMore: boolean;
        nextCursor: string;
    }>;
    createMessage(tripDocumentId: string, userId: number, body: string): Promise<{
        id: number;
        documentId: string;
        message: string;
        createdAt: Date;
        sender: {
            id: number;
            username: string | null;
            email: string;
            userProfile: {
                fullName: string | null;
                avatar: string | null;
            } | null;
        };
    }>;
    deleteChatForCompletedTrip(tripDocumentId: string): Promise<void>;
    canJoinSocketRoom(tripDocumentId: string, userId: number): Promise<boolean>;
    private assertChatAccess;
    private canAccessTripChat;
    private findOrCreateChat;
    private notifyTripChatRecipients;
    private buildChatNotificationPreview;
    private getTripOrThrow;
    private runWithChatTableGuard;
    private isMissingChatTableError;
}
