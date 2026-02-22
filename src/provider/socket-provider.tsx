'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
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
    let cleanup = () => {
      // Provide a defined empty block
    };
    let customSocket: any = null;

    if (
      process.env.NEXT_PUBLIC_PUSHER_KEY &&
      process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    ) {
      void import('pusher-js').then(({ default: Pusher }) => {
        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        });

        const globalChannel = pusher.subscribe('global');

        customSocket = {
          on: (event: string, callback: (...args: any[]) => void) => {
            // Unpack args array sent from backend pusher.trigger
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            globalChannel.bind(event, (data: any[]) => callback(...data));
          },
          off: (event: string, _callback: (...args: any[]) => void) => {
            globalChannel.unbind(event);
          },
          emit: () => {
            console.warn('Pusher client cannot emit directly in this setup');
          },
          disconnect: () => {
            pusher.disconnect();
          },
        };

        pusher.connection.bind('connected', () => setIsConnected(true));
        pusher.connection.bind('disconnected', () => setIsConnected(false));

        setSocket(customSocket as SocketType);

        cleanup = () => {
          pusher.disconnect();
        };
      });
    } else {
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

      cleanup = () => {
        socketInstance.disconnect();
      };
    }

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
