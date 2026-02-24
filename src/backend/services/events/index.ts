// src/services/sse.service.ts

export type SSEEventName =
    | 'nrc-login-step'
    | 'login-code';

export type SSEPayload = {
    /** Puppeteer milestone events */
    'nrc-login-step': {
        step: 'ready' | 'processing' | 'success' | 'error';
        sessionId: string;
        message?: string;
    };
    /** Emitted after email is submitted — tells the client to show the code modal */
    'login-code': {
        step: 'awaiting-code';
        sessionId: string;
    };
};

type Controller = ReadableStreamDefaultController<Uint8Array>;

type QueuedSSEEvent = {
    name: string;
    data: unknown;
};

declare global {
    // eslint-disable-next-line no-var
    var __sseService: SSEService | undefined;
}

class SSEService {
    /** Live stream controllers, keyed by sessionId */
    private controllers = new Map<string, Controller>();

    /** Events emitted before the client opened the stream */
    private queues = new Map<string, QueuedSSEEvent[]>();

    private encoder = new TextEncoder();

    // ─── Formatting ───────────────────────────────────────────────────────────

    private format(name: string, data: unknown): string {
        return `event: ${name}\ndata: ${JSON.stringify(data)}\n\n`;
    }

    private write(controller: Controller, name: string, data: unknown) {
        try {
            controller.enqueue(this.encoder.encode(this.format(name, data)));
        } catch {
            // Stream already closed — ignore
        }
    }

    // ─── Registration ─────────────────────────────────────────────────────────

    /**
     * Called by GET /api/nrc/stream/[sessionId] when the browser connects.
     * Returns a ReadableStream that stays open until the session ends.
     */
    public register(sessionId: string): ReadableStream<Uint8Array> {
        // Close previous controller if any, but don't clear the queue yet
        const old = this.controllers.get(sessionId);
        if (old) {
            try { old.close(); } catch { /* ignore */ }
            this.controllers.delete(sessionId);
        }

        const stream = new ReadableStream<Uint8Array>({
            start: (controller) => {
                this.controllers.set(sessionId, controller);

                // Flush events that fired before the client connected
                const pending = this.queues.get(sessionId) ?? [];
                for (const { name, data } of pending) {
                    this.write(controller, name, data);
                }
                this.queues.delete(sessionId);

                console.log(`[SSEService] Stream opened: ${sessionId}`);
            },
            cancel: () => {
                console.log(`[SSEService] Stream cancelled by client: ${sessionId}`);
                this.controllers.delete(sessionId);
            },
        });

        return stream;
    }

    // ─── Emit ─────────────────────────────────────────────────────────────────

    /**
     * Push a typed SSE event to the client for a given session.
     * If the client hasn't connected yet the event is queued and replayed on connect.
     */
    public emit<Ev extends SSEEventName>(
        sessionId: string,
        name: Ev,
        data: SSEPayload[Ev],
    ) {
        const controller = this.controllers.get(sessionId);

        if (controller) {
            this.write(controller, name, data);
        } else {
            const queue = this.queues.get(sessionId) ?? [];
            queue.push({ name, data });
            this.queues.set(sessionId, queue);
            console.warn(
                `[SSEService] Client not connected for "${sessionId}". ` +
                `Queued "${name}" (queue length: ${queue.length})`
            );
        }

        // Close the stream automatically after terminal events
        const isTerminal =
            name === 'nrc-login-step' &&
            (
                (data as SSEPayload['nrc-login-step']).step === 'success' ||
                (data as SSEPayload['nrc-login-step']).step === 'error'
            );

        if (isTerminal) {
            setTimeout(() => this.close(sessionId), 300);
        }
    }

    // ─── Cleanup ──────────────────────────────────────────────────────────────

    public close(sessionId: string) {
        const controller = this.controllers.get(sessionId);
        if (controller) {
            try { controller.close(); } catch { /* already closed */ }
            this.controllers.delete(sessionId);
        }
        this.queues.delete(sessionId);
        console.log(`[SSEService] Session cleaned up: ${sessionId}`);
    }

    public get activeSessionCount(): number {
        return this.controllers.size;
    }
}

export const sseService = (globalThis.__sseService ??= new SSEService());