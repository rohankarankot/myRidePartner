import { io, Socket } from 'socket.io-client';
import { CONFIG } from '@/constants/config';

class SocketService {
    private socket: Socket | null = null;

    connect(userId: number) {
        if (this.socket?.connected) {
            return;
        }

        this.socket = io(CONFIG.STRAPI_URL, {
            transports: ['polling', 'websocket'], // Allow polling first, then upgrade
            forceNew: true,
            reconnectionAttempts: 5,
            timeout: 10000,
        });

        this.socket.on('connect', () => {
            console.log('[Socket] Connected to server');
            // Authenticate with backend to join personal room
            this.socket?.emit('authenticate', userId);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            console.log('[Socket] Disconnected manually');
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
        this.emit('join_trip', tripId);
    }

    leaveTrip(tripId: string) {
        this.emit('leave_trip', tripId);
    }

    isConnected() {
        return this.socket?.connected || false;
    }
}

export const socketService = new SocketService();
