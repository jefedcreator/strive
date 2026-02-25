'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { io as ClientIO } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@/types/socket.types';

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

type SocketContextType = {
  socket: SocketType | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<SocketType | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to Socket.IO Custom Server
    const socketInstance: SocketType = ClientIO(
      process.env.NEXT_PUBLIC_SERVER_URL ?? window.location.origin,
      {
        path: '/api/socket/io',
        addTrailingSlash: false,
      }
    );

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    const cleanup = () => {
      socketInstance.disconnect();
    };

    return () => {
      cleanup();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
