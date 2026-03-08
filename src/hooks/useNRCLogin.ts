// src/hooks/useNRCLogin.ts
//
// Full flow:
//   idle
//     → [click button]
//   initializing  (POST /api/nrc/init)
//     → [sessionId received, EventSource opens]
//   navigating    (waiting for SSE 'ready')
//     → [SSE: nrc-login-step { step: 'ready' }]
//   email-modal   (user types email, clicks submit)
//     → [POST /api/nrc/email]
//   awaiting-code (waiting for SSE 'login-code')
//     → [SSE: login-code { step: 'awaiting-code' }]
//   code-modal    (user types OTP, clicks submit)
//     → [POST /api/nrc/code]
//   processing    (Puppeteer submitting code)
//     → [SSE: nrc-login-step { step: 'success' }]
//   success | error

import type { NikeAuthResult } from '@/backend/services/puppeteer';
import { useCallback, useEffect, useRef, useState } from 'react';
import useSessionStorage from './useSessionStorage';

export type NRCLoginStep =
  | 'idle'
  | 'initializing' // POST /api/nrc/init in-flight
  | 'navigating' // browser loading nike.com/login
  | 'email-modal' // ready: show email input modal
  | 'awaiting-code' // email submitted, waiting for SSE login-code event
  | 'code-modal' // show OTP / verification code modal
  | 'processing' // code submitted, Puppeteer finishing login
  | 'success'
  | 'error';

interface UseNRCLoginReturn {
  step: NRCLoginStep;
  sessionStep: NRCLoginStep;
  error: string | null;
  result: NikeAuthResult | null;
  initLogin: () => Promise<void>;
  submitEmail: (email: string) => Promise<void>;
  submitCode: (code: string) => Promise<void>;
  setEmail: (email: string) => void;
  setCode: (code: string) => void;
  email: string;
  code: string;
  reset: () => void;
}

export function useNRCLogin(): UseNRCLoginReturn {
  const sessionIdRef = useRef<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const [sessionStep, setSessionStep] = useSessionStorage<NRCLoginStep>(
    'nrc_login_step',
    'idle'
  );
  const [email, setEmail] = useSessionStorage<string>('nrc_login_email', '');
  const [code, setCode] = useSessionStorage<string>('nrc_login_code', '');

  const [step, setStep] = useState<NRCLoginStep>(sessionStep);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NikeAuthResult | null>(null);

  const setCurrentStep = useCallback(
    (next: NRCLoginStep) => {
      setStep(next);
      setSessionStep(next);
    },
    [setSessionStep]
  );

  const openStream = useCallback(
    (sessionId: string) => {
      eventSourceRef.current?.close();

      const es = new EventSource(`/api/login/nrc/stream/${sessionId}`);
      eventSourceRef.current = es;

      // ── Puppeteer milestone events ────────────────────────────────────────
      es.addEventListener('nrc-login-step', (e: MessageEvent<string>) => {
        const data = JSON.parse(e.data) as {
          step: string;
          sessionId: string;
          message?: string;
        };
        if (data.sessionId !== sessionIdRef.current) return;

        switch (data.step) {
          case 'ready':
            // Nike email form is loaded → show email modal
            setEmail('');
            setCode('');
            setCurrentStep('email-modal');
            break;
          case 'processing':
            setCurrentStep('processing');
            break;
          case 'success':
            setCurrentStep('success');
            setEmail('');
            setCode('');
            es.close();
            break;
          case 'error':
            setError(data.message ?? 'An unknown error occurred.');
            // If error happens, we typically want to clear the code to allow retry
            setCode('');
            setCurrentStep('error');
            es.close();
            break;
        }
      });

      // ── Code modal trigger ────────────────────────────────────────────────
      es.addEventListener('login-code', (e: MessageEvent<string>) => {
        const data = JSON.parse(e.data) as {
          step: string;
          sessionId: string;
        };
        if (data.sessionId !== sessionIdRef.current) return;

        setStep((current) => {
          if (current === 'error') return current;
          if (data.step === 'awaiting-code') {
            setSessionStep('code-modal');
            return 'code-modal';
          }
          return current;
        });
      });

      // ── Code modal trigger ────────────────────────────────────────────────
      es.addEventListener('success', (e: MessageEvent<string>) => {
        es.close();
      });

      es.onerror = () => {
        setError((prev) => {
          if (prev) return prev;

          // If the socket closes and we are still processing/waiting, we should try to reconnect
          if (sessionStep !== 'idle' && sessionStep !== 'success' && sessionStep !== 'error') {
            return 'Connection lost. Please wait while we reconnect...';
          }
          return 'Connection to server lost. Please try again.';
        });

        // Don't change step if we just temporarily lost connection while waiting
        if (sessionStep === 'idle' || sessionStep === 'success') {
          setCurrentStep('error');
        }
        es.close();
      };
    },
    [setCurrentStep, setEmail, setCode, setSessionStep, sessionStep]
  );

  // ─── Reset on Refresh logic ──────────────────────────────────────────────

  useEffect(() => {
    // If the sessionStep is active but this is a fresh mount (e.g. page refresh),
    // we might want to reset it.
    // Note: sessionStorage persists on refresh, so we need a way to detect
    // if this is a "first load" of the session.
    // A simple way is to check if we have an active stream. If not, we reset.
    if (sessionStep !== 'idle' && !sessionIdRef.current) {
      setSessionStep('idle');
      setStep('idle');
    }
  }, [sessionStep, setSessionStep]);

  // ─── Connection Recovery (iOS / Chrome backgrounding) ──────────────────────

  useEffect(() => {
    const handleVisibilityChange = () => {
      // Re-establish connection if the app comes back to the foreground
      // and we have an active session that isn't finished
      if (
        document.visibilityState === 'visible' &&
        sessionIdRef.current &&
        sessionStep !== 'idle' &&
        sessionStep !== 'success' &&
        sessionStep !== 'error'
      ) {
        // Only reopen if the connection is closed or closing
        if (
          !eventSourceRef.current ||
          eventSourceRef.current.readyState === EventSource.CLOSED
        ) {
          console.log('[useNRCLogin] 🔄 Reconnecting EventSource after backgrounding');
          openStream(sessionIdRef.current);
          setError(null);
        }
      }
    };

    const handleOnline = () => {
      if (
        sessionIdRef.current &&
        sessionStep !== 'idle' &&
        sessionStep !== 'success' &&
        sessionStep !== 'error'
      ) {
        console.log('[useNRCLogin] 🔄 Reconnecting EventSource after going online');
        openStream(sessionIdRef.current);
        setError(null);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [openStream, sessionStep]);

  // ─── Cleanup on unmount ───────────────────────────────────────────────────

  useEffect(
    () => () => {
      eventSourceRef.current?.close();
    },
    []
  );

  // ─── Step 1: Init ─────────────────────────────────────────────────────────

  const initLogin = useCallback(async () => {
    eventSourceRef.current?.close();
    setCurrentStep('initializing');
    setError(null);
    setResult(null);
    sessionIdRef.current = null;

    try {
      const res = await fetch('/api/login/nrc/stream/init', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to start Nike session.');

      const { sessionId } = (await res.json()) as { sessionId: string };
      sessionIdRef.current = sessionId;

      openStream(sessionId); // open before navigation completes
      setCurrentStep('navigating');
    } catch (err: any) {
      setError(err.message);
      setCurrentStep('error');
    }
  }, [openStream]);

  // ─── Step 2: Submit email ─────────────────────────────────────────────────

  const submitEmail = useCallback(
    async (email: string) => {
      if (!sessionIdRef.current) {
        setError('No active session. Please try again.');
        setCurrentStep('error');
        return;
      }

      // Transition to a waiting state while Puppeteer types + clicks Continue
      setCurrentStep('awaiting-code');

      try {
        const res = await fetch('/api/login/nrc/stream/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sessionIdRef.current, email }),
        });

        if (!res.ok) {
          const { error: msg } = (await res.json()) as { error: string };
          throw new Error(msg ?? 'Failed to submit email.');
        }
        // The 'login-code' SSE event will drive the step → 'code-modal'
      } catch (err: any) {
        setError(err.message);
        setCurrentStep('error');
        setSessionStep('idle');
      }
    },
    [setCurrentStep, setSessionStep]
  );

  // ─── Step 3: Submit OTP code ──────────────────────────────────────────────

  const submitCode = useCallback(
    async (code: string) => {
      if (!sessionIdRef.current) {
        setError('No active session. Please try again.');
        setCurrentStep('error');
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const clubId = params.get('clubId');
      const leaderboardId = params.get('leaderboardId');
      const inviteId = params.get('inviteId');
      const callbackUrl = params.get('callbackUrl');

      setCurrentStep('processing');

      try {
        const res = await fetch('/api/login/nrc/stream/code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            code,
            clubId,
            leaderboardId,
            inviteId,
            callbackUrl,
          }),
        });

        if (!res.ok) {
          const { error: msg } = (await res.json()) as { error: string };
          throw new Error(msg ?? 'Failed to submit code.');
        }

        const data = (await res.json()) as any;

        if (data.action === 'redirect' && data.redirectUrl) {
          console.log(
            `[useNRCLogin] 🚀 Server signaled redirect to: ${data.redirectUrl}`
          );
          window.location.href = data.redirectUrl;
          return;
        }

        setResult(data as NikeAuthResult);
        setCurrentStep('success');
        setEmail('');
        setCode('');
      } catch (err: any) {
        setError(err.message);
        // User requested to delete only code if it breaks at the code phase
        setCode('');
        setCurrentStep('error');
      }
    },
    [setEmail, setCode, setCurrentStep]
  );

  // ─── Reset ────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    sessionIdRef.current = null;
    setCurrentStep('idle');
    setSessionStep('idle');
    setEmail('');
    setCode('');
    setError(null);
    setResult(null);
  }, [setEmail, setCode, setCurrentStep, setSessionStep]);

  return {
    step,
    error,
    result,
    initLogin,
    submitEmail,
    submitCode,
    reset,
    sessionStep,
    email,
    setEmail,
    code,
    setCode,
  };
}
