'use client';

import type { ApiError } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { toast } from 'sonner';
import { SiNike,SiStrava } from 'react-icons/si'


function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  // Mutation Logic
  const loginMutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to authenticate');
      return response.json();
    },
    onSuccess: (result) => {
      if (result.action === 'redirect' && result.url) {
        window.location.href = result.url;
      } else {
        toast.success(`Welcome back!`);
        router.push('/home');
      }
    },
    onError: (error: ApiError) => toast.error(error.message),
  });

  const handleStravaLogin = () => {
    const clubId = searchParams.get('clubId') ?? undefined;
    const leaderboardId = searchParams.get('leaderboardId') ?? undefined;
    const inviteId = searchParams.get('inviteId') ?? undefined;
    loginMutation.mutate({ type: 'strava', clubId, leaderboardId, inviteId });
  };

  const handleNRCLogin = () => {
    const clubId = searchParams.get('clubId') ?? undefined;
    const leaderboardId = searchParams.get('leaderboardId') ?? undefined;
    const inviteId = searchParams.get('inviteId') ?? undefined;
    toast.promise(
      loginMutation.mutateAsync({
        type: 'nrc',
        clubId,
        leaderboardId,
        inviteId,
      }),
      {
        loading: 'Opening Nike login...',
        success: () => {
          if (!clubId && !leaderboardId) {
            router.push('/home');
          }
          return 'Welcome to Strive!';
        },
        error: (err) => err.message,
      }
    );
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background Decoratives */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none select-none">
        <svg
          className="absolute top-10 left-10 w-64 h-64 text-gray-900 dark:text-gray-100 bg-pattern-item"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M13 10V3L4 14h7v7l9-11h-7z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="0.5"
          />
        </svg>
        <svg
          className="absolute bottom-20 right-20 w-96 h-96 text-gray-900 dark:text-gray-100 bg-pattern-item"
          fill="none"
          stroke="currentColor"
          style={{ animationDelay: '2s' }}
          viewBox="0 0 24 24"
        >
          <path
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="0.2"
          />
        </svg>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-primary rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      </div>
      {/* Screens */}
      <main className="relative z-10 min-h-screen flex flex-col items-center py-12 px-4">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center mb-4">
              <h1 className="text-6xl font-black tracking-tighter text-gray-900 dark:text-white relative">
                STR
                <span className="relative inline-block">
                  I
                  <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    <span className="dot dot-red"></span>
                    <span className="dot dot-green"></span>
                    <span className="dot dot-blue"></span>
                  </span>
                </span>
                VE
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
              Sync your fitness journey across platforms.
            </p>
          </div>

          <div className="w-full bg-card-light dark:bg-card-dark rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 overflow-hidden transform hover:scale-[1.01] transition-transform">
            <div className="p-8 space-y-6">
              {/* Strava Login */}
              <button
                onClick={handleStravaLogin}
                className="w-full group relative flex justify-center items-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#FC4C02] hover:bg-[#e34402] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FC4C02] transition-all duration-200 shadow-lg"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                  <SiStrava className="h-5 w-5 text-white" />
                </span>
                Sign in with Strava
              </button>

              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center"
                >
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-card-light dark:bg-card-dark text-gray-400 dark:text-gray-500 uppercase font-bold text-[10px] tracking-widest">
                    OR
                  </span>
                </div>
              </div>
              {/* Nike Login */}
              <button
                onClick={handleNRCLogin}
                className="w-full group relative flex justify-center items-center py-4 px-4 border border-gray-300 dark:border-gray-700 text-sm font-bold rounded-xl text-white bg-black hover:bg-gray-900 dark:bg-black dark:hover:bg-gray-800 focus:outline-none transition-all duration-200 shadow-lg"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                  <SiNike className="h-6 w-10 text-white" />
                </span>
                Sign in with NRC
              </button> 
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/40 px-8 py-5 border-t border-gray-100 dark:border-gray-800 text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                By connecting, you agree to our
                <a
                  className="mx-1 font-semibold text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors underline decoration-dotted"
                  href="#"
                >
                  Terms of Service
                </a>
                and
                <a
                  className="mx-1 font-semibold text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors underline decoration-dotted"
                  href="#"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Main Page Export ---

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background-light">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
