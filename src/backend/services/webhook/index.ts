// src/services/webhook.ts
import { Server as SocketIOServer } from 'socket.io';
import type { Server as NetServer } from 'http';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '@/types/socket.types';

type QueuedEvent = {
  room: string | null; // null = global broadcast
  event: string;
  args: unknown[];
};

// ─── Why globalThis instead of a static class property ───────────────────────
//
// Next.js re-evaluates modules on hot reload and across API route boundaries.
// A module-level `static instance` produces MULTIPLE singletons in the same
// process — one where initialize() is called (the custom server), and a
// different one where emit() fires (API routes / Puppeteer service).
//
// Pinning to `globalThis` survives module re-evaluation: every import in every
// module boundary always gets the exact same WebhookService object.
//

class WebhookService {
  private io: SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  > | null = null;

  /**
   * Events emitted before any transport was ready.
   * Replayed automatically once a transport comes online.
   */
  private queue: QueuedEvent[] = [];

  constructor() { }

  // ─── Transport availability ───────────────────────────────────────────────

  private get hasTransport(): boolean {
    return this.io !== null;
  }

  // ─── Queue helpers ────────────────────────────────────────────────────────

  private enqueue(room: string | null, event: string, args: unknown[]) {
    this.queue.push({ room, event, args });
    console.warn(
      `[WebhookService] No transport ready yet. Queued "${event}" (queue length: ${this.queue.length})`
    );
  }

  private flushQueue() {
    if (this.queue.length === 0) return;

    console.log(
      `[WebhookService] Flushing ${this.queue.length} queued event(s)...`
    );
    for (const { room, event, args } of this.queue) {
      if (room === null) {
        this.dispatchGlobal(event, args);
      } else {
        this.dispatchToRoom(room, event, args);
      }
    }
    this.queue = [];
  }

  // ─── Raw dispatch (no queuing) ────────────────────────────────────────────

  private dispatchGlobal(event: string, args: unknown[]) {
    if (this.io) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.io.emit as any)(event, ...args);
    }
  }

  private dispatchToRoom(room: string, event: string, args: unknown[]) {
    if (this.io) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.io.to(room).emit as any)(event, ...args);
    }
  }

  // ─── Public API ───────────────────────────────────────────────────────────

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
        origin: '*',
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

    // Socket.IO is now live — drain any events queued before it was ready.
    this.flushQueue();

    return this.io;
  }

  public getIO() {
    if (!this.io) {
      throw new Error(
        'Socket.IO not initialized. Call initialize(httpServer) first.'
      );
    }
    return this.io;
  }

  public emit<Ev extends keyof ServerToClientEvents>(
    event: Ev,
    ...args: Parameters<ServerToClientEvents[Ev]>
  ) {
    if (!this.hasTransport) {
      this.enqueue(null, event as string, args);
      return;
    }
    this.dispatchGlobal(event as string, args);
  }

  public emitTo<Ev extends keyof ServerToClientEvents>(
    room: string,
    event: Ev,
    ...args: Parameters<ServerToClientEvents[Ev]>
  ) {
    if (!this.hasTransport) {
      this.enqueue(room, event as string, args);
      return;
    }
    this.dispatchToRoom(room, event as string, args);
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __webhookService: WebhookService | undefined;
}

// ─── Export a true process-level singleton ────────────────────────────────────
//
// `??=` constructs exactly once per Node.js process, regardless of how many
// times Next.js re-evaluates this module.
//
export const webhookService = (globalThis.__webhookService ??=
  new WebhookService());
