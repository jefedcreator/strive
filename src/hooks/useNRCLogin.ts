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
    | 'initializing'   // POST /api/nrc/init in-flight
    | 'navigating'     // browser loading nike.com/login
    | 'email-modal'    // ready: show email input modal
    | 'awaiting-code'  // email submitted, waiting for SSE login-code event
    | 'code-modal'     // show OTP / verification code modal
    | 'processing'     // code submitted, Puppeteer finishing login
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
    reset: () => void;
}

export function useNRCLogin(): UseNRCLoginReturn {
    const sessionIdRef = useRef<string | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    const [sessionStep, setSessionStep] = useSessionStorage<NRCLoginStep>('nrc_login_step', 'idle');
    const [step, setStep] = useState<NRCLoginStep>('idle');
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<NikeAuthResult | null>(null);

    // ─── SSE stream ───────────────────────────────────────────────────────────

    const openStream = useCallback((sessionId: string) => {
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
                    setStep('idle');
                    setSessionStep('email-modal');
                    break;
                case 'processing':
                    setStep('processing');
                    break;
                case 'success':
                    setStep('success');
                    setSessionStep('idle');
                    es.close();
                    break;
                case 'error':
                    setError(data.message ?? 'An unknown error occurred.');
                    setStep('error');
                    setSessionStep('idle');
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

            if (data.step === 'awaiting-code') {
                // Email was accepted — show the OTP / code modal
                setStep('idle');
                setSessionStep('code-modal');
            }
        });

        // ── Code modal trigger ────────────────────────────────────────────────
        es.addEventListener('success', (e: MessageEvent<string>) => {
            es.close();
        });

        es.onerror = () => {
            setStep((current) => {
                if (current === 'success' || current === 'error') return current;
                setError('Connection to server lost. Please try again.');
                setSessionStep('idle');
                return 'error';
            });
            es.close();
        };
    }, []);

    // ─── Cleanup on unmount ───────────────────────────────────────────────────

    useEffect(() => () => { eventSourceRef.current?.close(); }, []);

    // ─── Step 1: Init ─────────────────────────────────────────────────────────

    const initLogin = useCallback(async () => {
        eventSourceRef.current?.close();
        setStep('initializing');
        setError(null);
        setResult(null);
        sessionIdRef.current = null;

        try {
            const res = await fetch('/api/login/nrc/stream/init', { method: 'POST' });
            if (!res.ok) throw new Error('Failed to start Nike session.');

            const { sessionId } = await res.json() as { sessionId: string };
            sessionIdRef.current = sessionId;

            openStream(sessionId);     // open before navigation completes
            setStep('navigating');
        } catch (err: any) {
            setError(err.message);
            setStep('error');
        }
    }, [openStream]);

    // ─── Step 2: Submit email ─────────────────────────────────────────────────

    const submitEmail = useCallback(async (email: string) => {
        if (!sessionIdRef.current) {
            setError('No active session. Please try again.');
            setStep('error');
            return;
        }

        // Transition to a waiting state while Puppeteer types + clicks Continue
        setStep('awaiting-code');

        try {
            const res = await fetch('/api/login/nrc/stream/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: sessionIdRef.current, email }),
            });

            if (!res.ok) {
                const { error: msg } = await res.json() as { error: string };
                throw new Error(msg ?? 'Failed to submit email.');
            }
            // The 'login-code' SSE event will drive the step → 'code-modal'
        } catch (err: any) {
            setError(err.message);
            setStep('error');
        }
    }, []);

    // ─── Step 3: Submit OTP code ──────────────────────────────────────────────

    const submitCode = useCallback(async (code: string) => {
        if (!sessionIdRef.current) {
            setError('No active session. Please try again.');
            setStep('error');
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const clubId = params.get('clubId');
        const leaderboardId = params.get('leaderboardId');
        const inviteId = params.get('inviteId');

        setStep('processing');

        try {
            const res = await fetch('/api/login/nrc/stream/code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: sessionIdRef.current,
                    code,
                    clubId,
                    leaderboardId,
                    inviteId
                }),
            });

            if (!res.ok) {
                const { error: msg } = await res.json() as { error: string };
                throw new Error(msg ?? 'Failed to submit code.');
            }

            const data = await res.json() as any;

            if (data.action === 'redirect' && data.url) {
                console.log(`[useNRCLogin] 🚀 Server signaled redirect to: ${data.url}`);
                setSessionStep('idle');
                window.location.href = data.url;
                return;
            }

            setResult(data as NikeAuthResult);
            setStep('success');
            setSessionStep('idle');
        } catch (err: any) {
            setError(err.message);
            setStep('error');
        }
    }, []);

    // ─── Reset ────────────────────────────────────────────────────────────────

    const reset = useCallback(() => {
        eventSourceRef.current?.close();
        eventSourceRef.current = null;
        sessionIdRef.current = null;
        setStep('idle');
        setSessionStep('idle');
        setError(null);
        setResult(null);
    }, []);

    return { step, error, result, initLogin, submitEmail, submitCode, reset, sessionStep };
}