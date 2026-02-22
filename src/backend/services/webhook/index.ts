import { Server as SocketIOServer } from 'socket.io';
import Pusher from 'pusher';
import type { Server as NetServer } from 'http';
import type {
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData,
} from '@/types/socket.types';
import { env } from '@/env';

class WebhookService {
    private static instance: WebhookService;
    private io: SocketIOServer<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    > | null = null;
    private pusher: Pusher | null = null;

    private constructor() {
        // Singleton pattern
        if (
            env.PUSHER_APP_ID &&
            env.PUSHER_KEY &&
            env.PUSHER_SECRET &&
            env.PUSHER_CLUSTER
        ) {
            this.pusher = new Pusher({
                appId: env.PUSHER_APP_ID,
                key: env.PUSHER_KEY,
                secret: env.PUSHER_SECRET,
                cluster: env.PUSHER_CLUSTER,
                useTLS: true,
            });
            console.log('[WebhookService] Pusher initialized for Serverless environment');
        }
    }

    public static getInstance(): WebhookService {
        if (!WebhookService.instance) {
            WebhookService.instance = new WebhookService();
        }
        return WebhookService.instance;
    }

    public initialize(httpServer: NetServer) {
        if (this.io) {
            console.log('[WebhookService] Socket.IO already initialized');
            return this.io;
        }

        console.log('[WebhookService] Initializing Socket.IO server...');
        this.io = new SocketIOServer<
            ClientToServerEvents,
            ServerToClientEvents,
            InterServerEvents,
            SocketData
        >(httpServer, {
            path: '/api/socket/io',
            addTrailingSlash: false,
            cors: {
                origin: '*', // Adjust this for production security
                methods: ['GET', 'POST'],
            },
        });

        this.io.on('connection', (socket) => {
            console.log(`[WebhookService] Client connected: ${socket.id}`);

            socket.on('joinRoom', (room) => {
                void socket.join(room);
                console.log(`[WebhookService] Socket ${socket.id} joined room ${room}`);
            });

            socket.on('leaveRoom', (room) => {
                void socket.leave(room);
                console.log(`[WebhookService] Socket ${socket.id} left room ${room}`);
            });

            socket.on('disconnect', () => {
                console.log(`[WebhookService] Client disconnected: ${socket.id}`);
            });
        });

        return this.io;
    }

    public getIO() {
        if (!this.io) {
            throw new Error('Socket.IO is not initialized yet. Call initialize() first.');
        }
        return this.io;
    }

    // Helper method to emit events to specific rooms or globally
    public emit<Ev extends keyof ServerToClientEvents>(
        event: Ev,
        ...args: Parameters<ServerToClientEvents[Ev]>
    ) {
        if (this.io) {
            this.io.emit(event, ...args);
        }

        if (this.pusher) {
            void this.pusher.trigger('global', event as string, args);
        }

        if (!this.io && !this.pusher) {
            console.warn(`[WebhookService] No transport initialized. Missed event. Event: ${String(event)}`);
        }
    }

    public emitTo<Ev extends keyof ServerToClientEvents>(
        room: string,
        event: Ev,
        ...args: Parameters<ServerToClientEvents[Ev]>
    ) {
        if (this.io) {
            this.io.to(room).emit(event, ...args);
        }

        if (this.pusher) {
            void this.pusher.trigger(room, event as string, args);
        }

        if (!this.io && !this.pusher) {
            console.warn(`[WebhookService] No transport initialized. Missed event. Event: ${String(event)}`);
        }
    }
}

export const webhookService = WebhookService.getInstance();
