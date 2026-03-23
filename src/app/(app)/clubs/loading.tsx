import { Skeleton } from '@/primitives';
import Background from '@/components/background';

export default function Loading() {
  return (
    <div className="relative">
      <Background />
      <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Page Header Area Skeleton */}
      <div className="mb-6 md:mb-10 mt-16 lg:mt-0">
        <div className="flex text-sm mb-2 md:hidden">
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64 md:h-10" />
            <Skeleton className="h-5 w-80 md:w-96" />
          </div>
          <Skeleton className="h-11 w-full sm:w-44 rounded-xl" />
        </div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-[46px] w-full rounded-xl" />
      </div>

      {/* Tabs List Skeleton */}
      <div className="flex gap-4 mb-8">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-20 rounded-lg" />
        ))}
      </div>

      {/* Grid of Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 pb-20 md:pb-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white/50 dark:bg-white/5 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 h-[220px]"
          >
            <div className="flex justify-between items-start mb-6">
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
  );
}
