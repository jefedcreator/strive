import { useState, useEffect, useRef, useCallback } from 'react';

export type EventStreamStatus = 'idle' | 'connecting' | 'connected' | 'error';

export interface UseEventOptions {
  events?: Record<string, (event: MessageEvent<string>) => void>;
  onMessage?: (event: MessageEvent<string>) => void;
  onOpen?: (event: Event) => void;
  onError?: (event: Event) => void;
  autoReconnect?: boolean;
}

export interface UseEventReturn {
  status: EventStreamStatus;
  error: string | null;
  connect: (url: string) => void;
  disconnect: () => void;
}

export function useEvent(options: UseEventOptions = {}): UseEventReturn {
  const {
    events = {},
    onMessage,
    onOpen,
    onError,
    autoReconnect = true,
  } = options;

  const eventSourceRef = useRef<EventSource | null>(null);
  const urlRef = useRef<string | null>(null);

  const [status, setStatus] = useState<EventStreamStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Keep handler refs fresh without re-creating connect/disconnect
  const eventsRef = useRef(events);
  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    eventsRef.current = events;
    onMessageRef.current = onMessage;
    onOpenRef.current = onOpen;
    onErrorRef.current = onError;
  });

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    urlRef.current = null;
    setStatus('idle');
    setError(null);
  }, []);

  const connect = useCallback(
    (url: string) => {
      disconnect();
      urlRef.current = url;
      setStatus('connecting');
      setError(null);

      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onopen = (e) => {
        setStatus('connected');
        onOpenRef.current?.(e);
      };

      es.onmessage = (e) => {
        onMessageRef.current?.(e);
      };

      es.onerror = (e) => {
        setStatus('error');
        setError('Connection lost');
        onErrorRef.current?.(e);
        es.close();
      };

      Object.keys(eventsRef.current).forEach((eventName) => {
        es.addEventListener(eventName, (e: MessageEvent) => {
          const handler = eventsRef.current[eventName];
          handler?.(e);
        });
      });
    },
    [disconnect]
  );

  // ── Auto-reconnect on tab focus / network recovery ────────────────────────
  useEffect(() => {
    if (!autoReconnect) return;

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' &&
        urlRef.current &&
        (!eventSourceRef.current ||
          eventSourceRef.current.readyState === EventSource.CLOSED)
      ) {
        console.log('[useEvent] Reconnecting after backgrounding');
        connect(urlRef.current);
      }
    };

    const handleOnline = () => {
      if (
        urlRef.current &&
        (!eventSourceRef.current ||
          eventSourceRef.current.readyState === EventSource.CLOSED)
      ) {
        console.log('[useEvent] Reconnecting after network recovery');
        connect(urlRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [connect, autoReconnect]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  return { status, error, connect, disconnect };
}
