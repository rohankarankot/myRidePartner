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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');

  constructor(private readonly jwtService: JwtService) {}

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
    @MessageBody() data: { tripDocumentId: string },
  ) {
    const { tripDocumentId } = data;
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
    @MessageBody() data: { tripDocumentId: string },
  ) {
    const { tripDocumentId } = data;
    if (tripDocumentId) {
      const room = `trip_${tripDocumentId}`;
      client.leave(room);
      this.logger.log(`Client ${client.id} left trip room ${room}`);
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
}
