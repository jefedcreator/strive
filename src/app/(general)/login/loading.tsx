import { Skeleton } from '@/primitives';

export default function Loading() {
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
      <main className="relative z-10 min-h-screen flex flex-col items-center py-12 px-4 animate-in fade-in duration-700 pt-[env(safe-area-inset-top,12px)]">
        {/* Back Button Skeleton */}
        <div className="absolute top-6 left-6">
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>

        <div className="w-full max-w-md mt-8 space-y-12">
          {/* Logo and Header Skeleton */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Skeleton className="h-8 w-32" />
            </div>
            <Skeleton className="h-6 w-3/4 mx-auto" />
          </div>

          {/* Login Card Skeleton */}
          <div className="w-full bg-card-light dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-8 space-y-6">
              {/* Strava Button Skeleton */}
              <Skeleton className="h-14 w-full rounded-xl" />

              {/* Divider Skeleton */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                <Skeleton className="h-3 w-8" />
                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
              </div>

              {/* Nike Button Skeleton */}
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>

            {/* Bottom Bar Skeleton */}
            <div className="bg-gray-50 dark:bg-gray-900/40 px-8 py-5 border-t border-gray-100 dark:border-gray-800">
              <div className="flex flex-wrap justify-center gap-1">
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
