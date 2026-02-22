export interface ServerToClientEvents {
    // Define events that the server sends to the client
    notification: (data: { title: string; message: string; type?: 'info' | 'success' | 'warning' | 'error' }) => void;
    'club-invite': (data: { clubId: string; inviteId: string; inviterName: string }) => void;
    'leaderboard-invite': (data: { leaderboardId: string; inviteId: string; inviterName: string }) => void;
    'run-synced': (data: { runId: string; success: boolean }) => void;
}

export interface ClientToServerEvents {
    // Define events that the client sends to the server
    joinRoom: (room: string) => void;
    leaveRoom: (room: string) => void;
}

export interface InterServerEvents {
    ping: () => void;
}

export interface SocketData {
    userId?: string;
}
