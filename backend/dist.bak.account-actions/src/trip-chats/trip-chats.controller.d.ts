import { TripChatsService } from './trip-chats.service';
import { CreateTripChatMessageDto, GetTripChatMessagesQueryDto } from './dto/trip-chats.dto';
export declare class TripChatsController {
    private readonly tripChatsService;
    constructor(tripChatsService: TripChatsService);
    getChatAccess(documentId: string, req: any): Promise<{
        tripDocumentId: string;
        canAccess: boolean;
        tripStatus: import("@prisma/client").$Enums.TripStatus;
        isCaptain: boolean;
    }>;
    getMessages(documentId: string, req: any, query: GetTripChatMessagesQueryDto): Promise<{
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
    createMessage(documentId: string, req: any, body: CreateTripChatMessageDto): Promise<{
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
}
