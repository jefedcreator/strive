import { Skeleton } from '@/primitives';
import Background from '@/components/background';

export default function Loading() {
  return (
    <div className="relative">
      <Background />
      <div className="flex flex-col h-full animate-in fade-in duration-500">
        {/* Header Skeleton */}
        <div className="mb-6 md:mb-8 mt-16 lg:mt-0 space-y-2">
          <Skeleton className="h-9 w-64 md:h-10" />
          <Skeleton className="h-5 w-80 md:w-96" />
        </div>

        {/* Filter Bar Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-[46px] w-full rounded-xl" />
        </div>

        {/* Tabs List Skeleton */}
        <div className="flex md:gap-4 gap-3 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="md:h-10 h-8 md:w-20 w-14 rounded-lg" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notification Feed Skeleton */}
          <div className="lg:col-span-2 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white/50 dark:bg-card-dark rounded-xl p-5 border border-gray-200 dark:border-gray-800 flex items-start gap-4 shadow-sm"
              >
                <Skeleton className="shrink-0 w-12 h-12 rounded-full" />
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex justify-between items-start">
                    <Skeleton className="w-16 h-4 rounded-full" />
                    <Skeleton className="w-10 h-3 rounded" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/3 rounded" />
                  </div>
                  <div className="flex gap-3">
                    <Skeleton className="h-8 w-20 rounded-lg" />
                    <Skeleton className="h-8 w-20 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
