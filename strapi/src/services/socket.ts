import { Server } from 'socket.io';

export default {
    init(strapi: any) {
        const io = new Server(strapi.server.httpServer, {
            cors: {
                origin: '*', // In production, refine this to your client URL
                methods: ['GET', 'POST'],
            },
        });

        // Attach to strapi object for global access
        strapi.io = io;

        io.on('connection', (socket) => {
            console.log(`[Socket] New connection: ${socket.id}`);

            // User joins their personal room based on their ID
            socket.on('authenticate', (userId: number) => {
                if (userId) {
                    const roomName = `user_${userId}`;
                    socket.join(roomName);
                    console.log(`[Socket] User ${userId} authenticated and joined room ${roomName}`);
                }
            });

            // User joins a specific trip room
            socket.on('join_trip', (tripId: string) => {
                if (tripId) {
                    const roomName = `trip_${tripId}`;
                    socket.join(roomName);
                    console.log(`[Socket] Socket ${socket.id} joined trip room ${roomName}`);
                }
            });

            socket.on('leave_trip', (tripId: string) => {
                if (tripId) {
                    const roomName = `trip_${tripId}`;
                    socket.leave(roomName);
                    console.log(`[Socket] Socket ${socket.id} left trip room ${roomName}`);
                }
            });

            socket.on('disconnect', () => {
                console.log(`[Socket] Disconnected: ${socket.id}`);
            });
        });

        console.log('[Socket] Socket.io initialized successfully');
    },
};
