import { Skeleton } from '@/primitives';

export default function Loading() {
  return (
    <div className="flex flex-col h-full px-0 mt-20 lg:mt-0 pb-10 animate-in fade-in duration-500">
      {/* Back link */}
      <div className="mb-5">
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Hero Banner Skeleton */}
      <div className="relative w-full rounded-2xl overflow-hidden mb-3 bg-gray-100 dark:bg-white/5 border border-white/20 dark:border-white/10 aspect-[3/1] md:aspect-[4/1] flex flex-col items-center justify-center">
        <Skeleton className="w-12 h-12 rounded-2xl mb-4" />
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>

      {/* Metadata pill row */}
      <div className="flex flex-wrap items-center gap-2 mb-8 mt-2">
        <Skeleton className="h-4 w-1/3" />
        <div className="flex items-center gap-2 ml-auto">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>

      {/* Grid: Leaderboards and Members */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Leaderboards List Skeleton */}
        <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 shadow-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-8" />
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="w-4 h-4" />
              </div>
            ))}
          </div>
        </div>

        {/* Members List Skeleton */}
        <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 shadow-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-8" />
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="w-10 h-4 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
