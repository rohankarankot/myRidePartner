import { io, Socket } from 'socket.io-client';

import { CONFIG } from '@/constants/config';
import { logger } from '@/shared/lib/logger';

class SocketService {
  private socket: Socket | null = null;

  connect(_userId: number, token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(CONFIG.API_URL, {
      auth: { token },
      autoConnect: false,
      transports: ['websocket'],
      forceNew: true,
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      logger.debug('[Socket] Connected to server');
    });

    this.socket.on('disconnect', (reason) => {
      logger.debug('[Socket] Disconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      logger.error('[Socket] Connection error', { error });
    });

    this.socket.connect();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      logger.debug('[Socket] Disconnected manually');
    }
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void) {
    this.socket?.off(event, callback);
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  joinTrip(tripId: string) {
    this.emit('join_trip', { tripDocumentId: tripId });
  }

  leaveTrip(tripId: string) {
    this.emit('leave_trip', { tripDocumentId: tripId });
  }

  joinChat(tripId: string) {
    this.emit('join_chat', { tripDocumentId: tripId });
  }

  leaveChat(tripId: string) {
    this.emit('leave_chat', { tripDocumentId: tripId });
  }

  setChatTyping(tripId: string, isTyping: boolean) {
    this.emit('chat_typing', { tripDocumentId: tripId, isTyping });
  }

  setChatScreenState(tripId: string, isActive: boolean) {
    this.emit('chat_screen_state', { tripDocumentId: tripId, isActive });
  }

  joinPublicChat(city?: string | null) {
    this.emit('join_public_chat', { city });
  }

  leavePublicChat(city?: string | null) {
    this.emit('leave_public_chat', { city });
  }

  joinGroupChat(groupId: string) {
    this.emit('join_group_chat', { groupId });
  }

  leaveGroupChat(groupId: string) {
    this.emit('leave_group_chat', { groupId });
  }

  setGroupChatTyping(groupId: string, isTyping: boolean) {
    this.emit('group_chat_typing', { groupId, isTyping });
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
