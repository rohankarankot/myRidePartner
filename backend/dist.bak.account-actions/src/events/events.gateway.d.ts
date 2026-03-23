import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly prisma;
    server: Server;
    private logger;
    private readonly typingTimeouts;
    private readonly activeTypers;
    private readonly chatPresence;
    private readonly activeChatViewers;
    private readonly activeLiveLocations;
    constructor(jwtService: JwtService, prisma: PrismaService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleAuthenticate(client: Socket, data: {
        userId: number;
    }): {
        status: string;
        message: string;
    };
    handleJoinTrip(client: Socket, data: {
        tripDocumentId: string;
    } | string): {
        status: string;
        room: string;
    } | undefined;
    handleLeaveTrip(client: Socket, data: {
        tripDocumentId: string;
    } | string): {
        status: string;
        room: string;
    } | undefined;
    handleJoinChat(client: Socket, data: {
        tripDocumentId: string;
    } | string): Promise<{
        status: string;
        message: string;
        room?: undefined;
    } | {
        status: string;
        room: string;
        message?: undefined;
    }>;
    handleLeaveChat(client: Socket, data: {
        tripDocumentId: string;
    } | string): {
        status: string;
        room: string;
    } | undefined;
    handleChatTyping(client: Socket, data: {
        tripDocumentId: string;
        isTyping: boolean;
    }): Promise<{
        status: string;
        message: string;
    } | {
        status: string;
        message?: undefined;
    }>;
    handleChatScreenState(client: Socket, data: {
        tripDocumentId: string;
        isActive: boolean;
    }): Promise<{
        status: string;
        message: string;
    } | {
        status: string;
        message?: undefined;
    }>;
    handleChatLiveLocation(client: Socket, data: {
        tripDocumentId: string;
        isSharing: boolean;
        latitude?: number;
        longitude?: number;
        heading?: number | null;
        speed?: number | null;
    }): Promise<{
        status: string;
        message: string;
    } | {
        status: string;
        message?: undefined;
    }>;
    emitToUser(userId: number, event: string, data: any): void;
    emitToTripRoom(tripDocumentId: string, event: string, data: any): void;
    emitToChatRoom(tripDocumentId: string, event: string, data: any): void;
    isUserActivelyViewingChat(tripDocumentId: string, userId: number): boolean;
    private getAuthorizedChatTrip;
    private setTypingState;
    private emitTypingSnapshot;
    private clearTypingForUser;
    private addChatPresence;
    private removeChatPresence;
    private emitPresenceSnapshot;
    private clearPresenceForClient;
    private setActiveChatViewer;
    private clearActiveChatViewersForClient;
    private emitLiveLocationSnapshotToClient;
    private emitLiveLocationSnapshot;
    private clearLiveLocationForTrip;
    private clearLiveLocationForClient;
}
