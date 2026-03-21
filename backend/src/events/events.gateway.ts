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

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers['authorization']?.split(' ')[1];
      
      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub || payload.userId || payload.id;

      if (userId) {
        client.data.userId = Number(userId);
        const room = `user_${userId}`;
        client.join(room);
        this.logger.log(`Client ${client.id} auto-authenticated as user ${userId}`);
      }
    } catch (err) {
      this.logger.warn(`Client ${client.id} failed authentication: ${err.message}`);
    }
  }

  handleDisconnect(client: Socket) {
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

    const trip = await this.prisma.trip.findUnique({
      where: { documentId: tripDocumentId },
      select: { id: true, creatorId: true, status: true },
    });

    if (!trip || trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
      return { status: 'error', message: 'Trip chat is unavailable' };
    }

    const isApprovedPassenger = await this.prisma.joinRequest.findFirst({
      where: {
        tripId: trip.id,
        passengerId: userId,
        status: JoinRequestStatus.APPROVED,
      },
      select: { id: true },
    });

    if (trip.creatorId !== userId && !isApprovedPassenger) {
      return { status: 'error', message: 'Not authorized for trip chat' };
    }

    const room = `chat_${tripDocumentId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined chat room ${room}`);
    return { status: 'joined', room };
  }

  @SubscribeMessage('leave_chat')
  handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tripDocumentId: string } | string,
  ) {
    const tripDocumentId = typeof data === 'string' ? data : data?.tripDocumentId;
    if (tripDocumentId) {
      const room = `chat_${tripDocumentId}`;
      client.leave(room);
      this.logger.log(`Client ${client.id} left chat room ${room}`);
      return { status: 'left', room };
    }
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
}
