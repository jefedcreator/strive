import { Skeleton } from '@/primitives';
import Background from '@/components/background';

export default function Loading() {
  return (
    <div className="relative">
      <Background />
      <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="mb-6 md:mb-10 mt-16 lg:mt-0">
        <div className="flex text-sm mb-2 md:hidden">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-9 w-48 md:h-10" />
          <Skeleton className="h-5 w-64 md:w-80" />
        </div>
      </div>

      {/* XP & Tier Section Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
        {/* Tier Card Skeleton */}
        <div className="md:col-span-1 bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-5 md:p-6 flex flex-col items-center text-center space-y-4">
          <Skeleton className="w-32 h-32 rounded-full" />
          <div className="space-y-2 w-full flex flex-col items-center">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="w-full space-y-2">
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-3 w-32 ml-auto" />
          </div>
          <div className="flex gap-2 w-full">
            <Skeleton className="h-10 flex-1 rounded-xl" />
            <Skeleton className="h-10 flex-1 rounded-xl" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="md:col-span-2 grid grid-cols-2 gap-3 md:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-4 md:p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-9 w-24 md:h-10" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      </div>

      {/* Tier Progression Skeleton */}
      <div className="mb-6 md:mb-10 overflow-hidden space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="flex items-center gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 min-w-[60px]">
              <Skeleton className="w-12 h-12 rounded-full" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-2 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Earned Badges Grid Skeleton */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 dark:border-gray-800 p-1 space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
