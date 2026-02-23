// src/hooks/useNRCLogin.ts
//
// Flow:
//   1. User clicks "Sign in with NRC"
//   2. POST /api/nrc/init  → gets sessionId, browser navigates to nike.com/login
//   3. Server emits 'nrc-login-step' { step: 'ready', sessionId } via socket
//   4. Hook opens email modal
//   5. User types email (+ password) and submits
//   6. POST /api/nrc/credentials → Puppeteer fills the form and completes login
//   7. Server emits 'nrc-login-step' { step: 'success' | 'error' }

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '@/provider/socket-provider';
import type { NikeAuthResult } from '@/backend/services/puppeteer';

export type NRCLoginStep =
    | 'idle'
    | 'initializing'   // waiting for /api/nrc/init to respond
    | 'navigating'     // browser is loading nike.com/login
    | 'email-modal'    // nike form is ready; show email/password modal to user
    | 'processing'     // credentials submitted; puppeteer is logging in
    | 'success'
    | 'error';

interface UseNRCLoginReturn {
    step: NRCLoginStep;
    error: string | null;
    result: NikeAuthResult | null;
    /** Call this when the user clicks the "Sign in with NRC" button */
    initLogin: () => Promise<void>;
    /** Call this when the user submits the email+password modal */
    submitCredentials: (email: string, password: string) => Promise<void>;
    reset: () => void;
}

export function useNRCLogin(): UseNRCLoginReturn {
    const socket = useSocket();                 // your existing socket instance
    const sessionIdRef = useRef<string | null>(null);

    const [step, setStep] = useState<NRCLoginStep>('idle');
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<NikeAuthResult | null>(null);

    // ─── Listen for server-side webhook events ────────────────────────────────
    useEffect(() => {
        if (!socket) return;

        const handleLoginStep = (data: { step: string; sessionId: string; message?: string }) => {
            console.log('handleLoginStep', data);
            console.log('sessionIdRef', sessionIdRef);

            // Only handle events for the session we started
            if (data.sessionId !== sessionIdRef.current) return;

            switch (data.step) {
                case 'ready':
                    // Nike form is loaded → show the email/password modal
                    setStep('email-modal');
                    break;
                case 'processing':
                    setStep('processing');
                    break;
                case 'success':
                    setStep('success');
                    break;
                case 'error':
                    setError(data.message ?? 'An unknown error occurred.');
                    setStep('error');
                    break;
            }
        };

        socket.socket?.on('nrc-login-step', handleLoginStep);
        return () => { socket.socket?.off('nrc-login-step', handleLoginStep); };
    }, [socket]);

    // ─── Step 1: Init session ─────────────────────────────────────────────────
    const initLogin = useCallback(async () => {
        setStep('initializing');
        setError(null);
        setResult(null);
        sessionIdRef.current = null;

        try {
            const res = await fetch('/api/login/nrc/init', { method: 'POST' });
            if (!res.ok) throw new Error('Failed to start Nike session.');

            const { sessionId } = await res.json() as { sessionId: string };
            sessionIdRef.current = sessionId;

            // Now we wait for the 'ready' socket event before doing anything else
            setStep('navigating');
        } catch (err: any) {
            setError(err.message);
            setStep('error');
        }
    }, []);

    // ─── Step 2: Submit credentials ───────────────────────────────────────────
    const submitCredentials = useCallback(async (email: string) => {
        if (!sessionIdRef.current) {
            setError('No active session. Please try again.');
            setStep('error');
            return;
        }

        setStep('processing');

        try {
            const res = await fetch('/api/nrc/credentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: sessionIdRef.current,
                    email,
                    // password,
                }),
            });

            if (!res.ok) {
                const { error: msg } = await res.json() as { error: string };
                throw new Error(msg ?? 'Credential submission failed.');
            }

            const authResult = await res.json() as NikeAuthResult;
            setResult(authResult);
            // 'success' step is also set by the socket event, but set it here
            // as a fallback in case socket delivery is delayed.
            setStep('success');
        } catch (err: any) {
            setError(err.message);
            setStep('error');
        }
    }, []);

    const reset = useCallback(() => {
        sessionIdRef.current = null;
        setStep('idle');
        setError(null);
        setResult(null);
    }, []);

    return { step, error, result, initLogin, submitCredentials, reset };
}
