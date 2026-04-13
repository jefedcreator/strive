import { Skeleton } from '@/primitives';
import Background from '@/components/background';

export default function Loading() {
  return (
    <div className="relative">
      <Background />
      <div className="flex flex-col h-full animate-in fade-in duration-500 container mx-auto max-w-7xl px-4 py-12 md:py-20 min-h-screen">
        {/* Back Button Skeleton */}
        <div className="mb-6 md:mb-8">
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Page Header Area Skeleton */}
        <div className="mb-6 md:mb-10 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-3/4 max-w-md" />
          </div>
        </div>

        {/* Filter Bar Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-8">
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-lg w-fit">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 pb-20 md:pb-0">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-card-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-800 h-[220px] space-y-6"
              >
                <div className="flex justify-between items-start">
                  <Skeleton className="w-12 h-12 rounded-2xl" />
                  <Skeleton className="w-20 h-6 rounded-full" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4 rounded" />
                  <Skeleton className="h-4 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
