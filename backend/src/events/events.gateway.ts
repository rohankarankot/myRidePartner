import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { JoinRequestStatus } from '@prisma/client';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');
  private readonly typingTimeouts = new Map<string, NodeJS.Timeout>();
  private readonly activeTypers = new Map<string, Map<number, { userId: number; userName: string }>>();
  private readonly chatPresence = new Map<
    string,
    Map<number, { userId: number; userName: string; connectionCount: number }>
  >();
  private readonly activeChatViewers = new Map<string, Map<number, number>>();
  private readonly activeLiveLocations = new Map<
    string,
    {
      userId: number;
      userName: string;
      latitude: number;
      longitude: number;
      heading: number | null;
      speed: number | null;
      updatedAt: string;
    }
  >();

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers['authorization']?.split(' ')[1];
      
      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub || payload.userId || payload.id;

      if (userId) {
        const user = await this.prisma.user.findUnique({
          where: { id: Number(userId) },
          select: {
            username: true,
            email: true,
            userProfile: {
              select: {
                fullName: true,
              },
            },
          },
        });

        client.data.userId = Number(userId);
        client.data.userName =
          user?.userProfile?.fullName ||
          user?.username ||
          payload.username ||
          payload.email ||
          `User ${userId}`;
        client.data.joinedChatRooms = new Set<string>();
        const room = `user_${userId}`;
        client.join(room);
        this.logger.log(`Client ${client.id} auto-authenticated as user ${userId}`);
      }
    } catch (err) {
      this.logger.warn(`Client ${client.id} failed authentication: ${err.message}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.clearTypingForUser(client.data.userId as number | undefined);
    this.clearPresenceForClient(client);
    this.clearActiveChatViewersForClient(client);
    this.clearLiveLocationForClient(client);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: number },
  ) {
    // Deprecated in favor of auto-auth on handshake
    this.logger.debug(`Client ${client.id} called deprecated authenticate event`);
    return { status: 'ok', message: 'Auth now handled via handshake token' };
  }

  @SubscribeMessage('join_trip')
  handleJoinTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tripDocumentId: string } | string,
  ) {
    const tripDocumentId = typeof data === 'string' ? data : data?.tripDocumentId;
    if (tripDocumentId) {
      const room = `trip_${tripDocumentId}`;
      client.join(room);
      this.logger.log(`Client ${client.id} joined trip room ${room}`);
      return { status: 'joined', room };
    }
  }

  @SubscribeMessage('leave_trip')
  handleLeaveTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tripDocumentId: string } | string,
  ) {
    const tripDocumentId = typeof data === 'string' ? data : data?.tripDocumentId;
    if (tripDocumentId) {
      const room = `trip_${tripDocumentId}`;
      client.leave(room);
      this.logger.log(`Client ${client.id} left trip room ${room}`);
      return { status: 'left', room };
    }
  }

  @SubscribeMessage('join_chat')
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tripDocumentId: string } | string,
  ) {
    const userId = client.data.userId as number | undefined;
    const tripDocumentId = typeof data === 'string' ? data : data?.tripDocumentId;

    if (!userId || !tripDocumentId) {
      return { status: 'error', message: 'Missing user or trip context' };
    }

    const trip = await this.getAuthorizedChatTrip(tripDocumentId, userId);

    if (!trip) {
      return { status: 'error', message: 'Trip chat is unavailable' };
    }

    const room = `chat_${tripDocumentId}`;
    client.join(room);
    this.addChatPresence(
      tripDocumentId,
      userId,
      (client.data.userName as string | undefined) || `User ${userId}`,
    );
    const joinedChatRooms = (client.data.joinedChatRooms as Set<string> | undefined) ?? new Set<string>();
    joinedChatRooms.add(tripDocumentId);
    client.data.joinedChatRooms = joinedChatRooms;
    this.logger.log(`Client ${client.id} joined chat room ${room}`);
    this.emitLiveLocationSnapshotToClient(client, tripDocumentId);
    return { status: 'joined', room };
  }

  @SubscribeMessage('leave_chat')
  handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tripDocumentId: string } | string,
  ) {
    const userId = client.data.userId as number | undefined;
    const tripDocumentId = typeof data === 'string' ? data : data?.tripDocumentId;
    if (tripDocumentId) {
      this.setTypingState(tripDocumentId, userId, client.data.userName as string | undefined, false);
      this.removeChatPresence(tripDocumentId, userId);
      this.clearLiveLocationForTrip(tripDocumentId, userId);
      const joinedChatRooms = client.data.joinedChatRooms as Set<string> | undefined;
      joinedChatRooms?.delete(tripDocumentId);
      const room = `chat_${tripDocumentId}`;
      client.leave(room);
      this.logger.log(`Client ${client.id} left chat room ${room}`);
      return { status: 'left', room };
    }
  }

  @SubscribeMessage('join_public_chat')
  handleJoinPublicChat(@ConnectedSocket() client: Socket) {
    if (!client.data.userId) {
      return { status: 'error', message: 'Missing user context' };
    }

    const room = 'public_chat';
    client.join(room);
    this.logger.log(`Client ${client.id} joined public chat room ${room}`);
    return { status: 'joined', room };
  }

  @SubscribeMessage('leave_public_chat')
  handleLeavePublicChat(@ConnectedSocket() client: Socket) {
    const room = 'public_chat';
    client.leave(room);
    this.logger.log(`Client ${client.id} left public chat room ${room}`);
    return { status: 'left', room };
  }

  @SubscribeMessage('chat_typing')
  async handleChatTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tripDocumentId: string; isTyping: boolean },
  ) {
    const userId = client.data.userId as number | undefined;
    const userName = client.data.userName as string | undefined;
    const tripDocumentId = data?.tripDocumentId;

    if (!userId || !tripDocumentId) {
      return { status: 'error', message: 'Missing typing context' };
    }

    const trip = await this.getAuthorizedChatTrip(tripDocumentId, userId);
    if (!trip) {
      return { status: 'error', message: 'Trip chat is unavailable' };
    }

    this.setTypingState(tripDocumentId, userId, userName, Boolean(data?.isTyping));
    return { status: 'ok' };
  }

  @SubscribeMessage('chat_screen_state')
  async handleChatScreenState(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tripDocumentId: string; isActive: boolean },
  ) {
    const userId = client.data.userId as number | undefined;
    const tripDocumentId = data?.tripDocumentId;

    if (!userId || !tripDocumentId) {
      return { status: 'error', message: 'Missing chat screen context' };
    }

    const trip = await this.getAuthorizedChatTrip(tripDocumentId, userId);
    if (!trip) {
      return { status: 'error', message: 'Trip chat is unavailable' };
    }

    this.setActiveChatViewer(tripDocumentId, userId, Boolean(data.isActive));
    return { status: 'ok' };
  }

  @SubscribeMessage('chat_live_location')
  async handleChatLiveLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      tripDocumentId: string;
      isSharing: boolean;
      latitude?: number;
      longitude?: number;
      heading?: number | null;
      speed?: number | null;
    },
  ) {
    const userId = client.data.userId as number | undefined;
    const userName = client.data.userName as string | undefined;
    const tripDocumentId = data?.tripDocumentId;

    if (!userId || !tripDocumentId) {
      return { status: 'error', message: 'Missing live location context' };
    }

    const trip = await this.getAuthorizedChatTrip(tripDocumentId, userId);
    if (!trip || trip.creatorId !== userId) {
      return { status: 'error', message: 'Only the ride captain can share live location' };
    }

    if (!data.isSharing) {
      this.clearLiveLocationForTrip(tripDocumentId, userId);
      return { status: 'stopped' };
    }

    if (
      typeof data.latitude !== 'number' ||
      typeof data.longitude !== 'number' ||
      Number.isNaN(data.latitude) ||
      Number.isNaN(data.longitude)
    ) {
      return { status: 'error', message: 'Missing or invalid coordinates' };
    }

    this.activeLiveLocations.set(tripDocumentId, {
      userId,
      userName: userName || `User ${userId}`,
      latitude: data.latitude,
      longitude: data.longitude,
      heading: typeof data.heading === 'number' ? data.heading : null,
      speed: typeof data.speed === 'number' ? data.speed : null,
      updatedAt: new Date().toISOString(),
    });

    this.emitLiveLocationSnapshot(tripDocumentId);
    return { status: 'ok' };
  }

  emitToUser(userId: number, event: string, data: any) {
    const room = `user_${userId}`;
    this.server.to(room).emit(event, data);
    this.logger.log(`Emitting ${event} to user room ${room}`);
  }

  emitToTripRoom(tripDocumentId: string, event: string, data: any) {
    const room = `trip_${tripDocumentId}`;
    this.server.to(room).emit(event, data);
    this.logger.log(`Emitting ${event} to trip room ${room}`);
  }

  emitToChatRoom(tripDocumentId: string, event: string, data: any) {
    const room = `chat_${tripDocumentId}`;
    this.server.to(room).emit(event, data);
    this.logger.log(`Emitting ${event} to chat room ${room}`);
  }

  emitToPublicChatRoom(event: string, data: any) {
    const room = 'public_chat';
    this.server.to(room).emit(event, data);
    this.logger.log(`Emitting ${event} to public chat room ${room}`);
  }

  isUserActivelyViewingChat(tripDocumentId: string, userId: number) {
    return Boolean(this.activeChatViewers.get(tripDocumentId)?.has(userId));
  }

  private async getAuthorizedChatTrip(tripDocumentId: string, userId: number) {
    const trip = await this.prisma.trip.findUnique({
      where: { documentId: tripDocumentId },
      select: { id: true, creatorId: true, status: true },
    });

    if (!trip || trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
      return null;
    }

    if (trip.creatorId === userId) {
      return trip;
    }

    const isApprovedPassenger = await this.prisma.joinRequest.findFirst({
      where: {
        tripId: trip.id,
        passengerId: userId,
        status: JoinRequestStatus.APPROVED,
      },
      select: { id: true },
    });

    if (!isApprovedPassenger) {
      return null;
    }

    return trip;
  }

  private setTypingState(
    tripDocumentId: string,
    userId: number | undefined,
    userName: string | undefined,
    isTyping: boolean,
  ) {
    if (!userId) {
      return;
    }

    const timeoutKey = `${tripDocumentId}:${userId}`;
    const existingTimeout = this.typingTimeouts.get(timeoutKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.typingTimeouts.delete(timeoutKey);
    }

    if (isTyping) {
      const roomTypers = this.activeTypers.get(tripDocumentId) ?? new Map();
      roomTypers.set(userId, {
        userId,
        userName: userName || `User ${userId}`,
      });
      this.activeTypers.set(tripDocumentId, roomTypers);

      const timeout = setTimeout(() => {
        this.setTypingState(tripDocumentId, userId, userName, false);
      }, 2500);
      this.typingTimeouts.set(timeoutKey, timeout);
    } else {
      const roomTypers = this.activeTypers.get(tripDocumentId);
      roomTypers?.delete(userId);

      if (roomTypers && roomTypers.size === 0) {
        this.activeTypers.delete(tripDocumentId);
      }
    }

    this.emitTypingSnapshot(tripDocumentId);
  }

  private emitTypingSnapshot(tripDocumentId: string) {
    const typingUsers = Array.from(this.activeTypers.get(tripDocumentId)?.values() ?? []);
    this.emitToChatRoom(tripDocumentId, 'chat_typing_updated', {
      tripDocumentId,
      typingUsers,
    });
  }

  private clearTypingForUser(userId?: number) {
    if (!userId) {
      return;
    }

    const keysToClear = Array.from(this.typingTimeouts.keys()).filter((key) => key.endsWith(`:${userId}`));
    for (const key of keysToClear) {
      clearTimeout(this.typingTimeouts.get(key)!);
      this.typingTimeouts.delete(key);

      const [tripDocumentId] = key.split(':');
      const roomTypers = this.activeTypers.get(tripDocumentId);
      roomTypers?.delete(userId);

      if (roomTypers && roomTypers.size === 0) {
        this.activeTypers.delete(tripDocumentId);
      } else {
        this.emitTypingSnapshot(tripDocumentId);
      }
    }
  }

  private addChatPresence(tripDocumentId: string, userId: number, userName: string) {
    const roomPresence = this.chatPresence.get(tripDocumentId) ?? new Map();
    const existingPresence = roomPresence.get(userId);

    roomPresence.set(userId, {
      userId,
      userName,
      connectionCount: (existingPresence?.connectionCount ?? 0) + 1,
    });

    this.chatPresence.set(tripDocumentId, roomPresence);
    this.emitPresenceSnapshot(tripDocumentId);
  }

  private removeChatPresence(tripDocumentId: string, userId?: number) {
    if (!userId) {
      return;
    }

    const roomPresence = this.chatPresence.get(tripDocumentId);
    const existingPresence = roomPresence?.get(userId);

    if (!roomPresence || !existingPresence) {
      return;
    }

    if (existingPresence.connectionCount > 1) {
      roomPresence.set(userId, {
        ...existingPresence,
        connectionCount: existingPresence.connectionCount - 1,
      });
    } else {
      roomPresence.delete(userId);
    }

    if (roomPresence.size === 0) {
      this.chatPresence.delete(tripDocumentId);
    } else {
      this.chatPresence.set(tripDocumentId, roomPresence);
    }

    this.emitPresenceSnapshot(tripDocumentId);
  }

  private emitPresenceSnapshot(tripDocumentId: string) {
    const onlineUsers = Array.from(this.chatPresence.get(tripDocumentId)?.values() ?? []).map(
      ({ userId, userName }) => ({
        userId,
        userName,
      }),
    );

    this.emitToChatRoom(tripDocumentId, 'chat_presence_updated', {
      tripDocumentId,
      onlineUsers,
    });
  }

  private clearPresenceForClient(client: Socket) {
    const userId = client.data.userId as number | undefined;
    const joinedChatRooms = client.data.joinedChatRooms as Set<string> | undefined;

    if (!userId || !joinedChatRooms?.size) {
      return;
    }

    for (const tripDocumentId of joinedChatRooms) {
      this.removeChatPresence(tripDocumentId, userId);
    }

    joinedChatRooms.clear();
  }

  private setActiveChatViewer(tripDocumentId: string, userId: number, isActive: boolean) {
    const tripViewers = this.activeChatViewers.get(tripDocumentId) ?? new Map<number, number>();
    const existingCount = tripViewers.get(userId) ?? 0;

    if (isActive) {
      tripViewers.set(userId, existingCount + 1);
      this.activeChatViewers.set(tripDocumentId, tripViewers);
      return;
    }

    if (existingCount <= 1) {
      tripViewers.delete(userId);
    } else {
      tripViewers.set(userId, existingCount - 1);
    }

    if (tripViewers.size === 0) {
      this.activeChatViewers.delete(tripDocumentId);
    } else {
      this.activeChatViewers.set(tripDocumentId, tripViewers);
    }
  }

  private clearActiveChatViewersForClient(client: Socket) {
    const userId = client.data.userId as number | undefined;
    const joinedChatRooms = client.data.joinedChatRooms as Set<string> | undefined;

    if (!userId || !joinedChatRooms?.size) {
      return;
    }

    for (const tripDocumentId of joinedChatRooms) {
      const tripViewers = this.activeChatViewers.get(tripDocumentId);
      if (!tripViewers?.has(userId)) {
        continue;
      }

      tripViewers.delete(userId);

      if (tripViewers.size === 0) {
        this.activeChatViewers.delete(tripDocumentId);
      } else {
        this.activeChatViewers.set(tripDocumentId, tripViewers);
      }
    }
  }

  private emitLiveLocationSnapshotToClient(client: Socket, tripDocumentId: string) {
    client.emit('chat_live_location_updated', {
      tripDocumentId,
      liveLocation: this.activeLiveLocations.get(tripDocumentId) ?? null,
    });
  }

  private emitLiveLocationSnapshot(tripDocumentId: string) {
    this.emitToChatRoom(tripDocumentId, 'chat_live_location_updated', {
      tripDocumentId,
      liveLocation: this.activeLiveLocations.get(tripDocumentId) ?? null,
    });
  }

  private clearLiveLocationForTrip(tripDocumentId: string, userId?: number) {
    if (!userId) {
      return;
    }

    const liveLocation = this.activeLiveLocations.get(tripDocumentId);
    if (!liveLocation || liveLocation.userId !== userId) {
      return;
    }

    this.activeLiveLocations.delete(tripDocumentId);
    this.emitLiveLocationSnapshot(tripDocumentId);
  }

  private clearLiveLocationForClient(client: Socket) {
    const userId = client.data.userId as number | undefined;
    const joinedChatRooms = client.data.joinedChatRooms as Set<string> | undefined;

    if (!userId || !joinedChatRooms?.size) {
      return;
    }

    for (const tripDocumentId of joinedChatRooms) {
      this.clearLiveLocationForTrip(tripDocumentId, userId);
    }
  }
}
