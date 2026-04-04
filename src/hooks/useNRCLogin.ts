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
import { useEvent } from './useEvent';

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

// Steps where the SSE stream should remain active
const ACTIVE_STEPS = new Set<NRCLoginStep>([
  'navigating',
  'email-modal',
  'awaiting-code',
  'code-modal',
  'processing',
]);

export function useNRCLogin(): UseNRCLoginReturn {
  const sessionIdRef = useRef<string | null>(null);

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

  // Keep a stable ref to setCurrentStep so SSE handlers don't close over stale values
  const setCurrentStepRef = useRef(setCurrentStep);
  useEffect(() => {
    setCurrentStepRef.current = setCurrentStep;
  });

  // ─── useEvent ────────────────────────────────────────────────────────────────
  // autoReconnect=true means useEvent will re-call connect() on tab-focus /
  // network-recovery, which re-subscribes our SSE handlers and preserves
  // whatever modal step is stored in sessionStorage.

  const { connect, disconnect } = useEvent({
    autoReconnect: true,

    // ── Puppeteer milestone events ──────────────────────────────────────────
    events: {
      'nrc-login-step': (e) => {
        const data = JSON.parse(e.data) as {
          step: string;
          sessionId: string;
          message?: string;
        };
        if (data.sessionId !== sessionIdRef.current) return;

        switch (data.step) {
          case 'ready':
            setEmail('');
            setCode('');
            setCurrentStepRef.current('email-modal');
            break;
          case 'processing':
            setCurrentStepRef.current('processing');
            break;
          case 'success':
            setCurrentStepRef.current('success');
            setEmail('');
            setCode('');
            disconnect();
            break;
          case 'error':
            setError(data.message ?? 'An unknown error occurred.');
            setCode('');
            setCurrentStepRef.current('error');
            disconnect();
            break;
        }
      },

      // ── Code modal trigger ────────────────────────────────────────────────
      'login-code': (e) => {
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
      },

      // ── Server signals successful auth ────────────────────────────────────
      success: () => {
        disconnect();
      },
    },

    onError: () => {
      setError((prev) => {
        if (prev) return prev;
        const currentStep = sessionIdRef.current ? sessionStep : 'idle';
        if (ACTIVE_STEPS.has(currentStep as NRCLoginStep)) {
          return 'Connection lost. Please wait while we reconnect...';
        }
        return 'Connection to server lost. Please try again.';
      });

      if (!ACTIVE_STEPS.has(sessionStep)) {
        setCurrentStep('error');
      }
    },
  });

  // ─── Reset on Refresh logic ──────────────────────────────────────────────

  useEffect(() => {
    // sessionStorage persists on refresh but sessionIdRef is gone → reset
    if (sessionStep !== 'idle' && !sessionIdRef.current) {
      setSessionStep('idle');
      setStep('idle');
    }
  }, [sessionStep, setSessionStep]);

  // ─── Step 1: Init ─────────────────────────────────────────────────────────

  const initLogin = useCallback(async () => {
    disconnect();
    setCurrentStep('initializing');
    setError(null);
    setResult(null);
    sessionIdRef.current = null;

    try {
      const res = await fetch('/api/login/nrc/stream/init', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to start Nike session.');

      const { sessionId } = (await res.json()) as { sessionId: string };
      sessionIdRef.current = sessionId;

      connect(`/api/login/nrc/stream/${sessionId}`);
      setCurrentStep('navigating');
    } catch (err: any) {
      setError(err.message);
      setCurrentStep('error');
    }
  }, [connect, disconnect, setCurrentStep]);

  // ─── Step 2: Submit email ─────────────────────────────────────────────────

  const submitEmail = useCallback(
    async (email: string) => {
      if (!sessionIdRef.current) {
        setError('No active session. Please try again.');
        setCurrentStep('error');
        return;
      }

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
        // The 'login-code' SSE event will drive step → 'code-modal'
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
        setCode('');
        setCurrentStep('error');
      }
    },
    [setEmail, setCode, setCurrentStep]
  );

  // ─── Reset ────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    disconnect();
    sessionIdRef.current = null;
    setCurrentStep('idle');
    setSessionStep('idle');
    setEmail('');
    setCode('');
    setError(null);
    setResult(null);
  }, [disconnect, setEmail, setCode, setCurrentStep, setSessionStep]);

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
