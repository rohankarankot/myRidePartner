import { io, Socket } from 'socket.io-client';
import { CONFIG } from '@/constants/config';

class SocketService {
    private socket: Socket | null = null;

    connect(userId: number, token: string) {
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
            console.log('[Socket] Connected to server (securely)');
            // Explicit authenticate emit is now deprecated but kept for backward compatibility if needed
            // this.socket?.emit('authenticate', userId);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error);
        });

        this.socket.connect();
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
