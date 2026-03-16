import { Skeleton } from '@/primitives';

export default function Loading() {
  return (
    <div className="relative min-h-screen flex flex-col items-center py-12 px-4 animate-in fade-in duration-700 pt-[env(safe-area-inset-top,12px)]">
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
    </div>
  );
}
