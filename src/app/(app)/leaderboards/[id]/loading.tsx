import { Skeleton } from '@/primitives';
import Background from '@/components/background';

export default function Loading() {
  return (
    <div className="relative w-full min-w-0 flex flex-col">
      <Background />
      <div className="flex flex-col w-full min-w-0 h-full px-1 mt-20 lg:mt-0 pb-10 animate-in fade-in duration-500">
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

      {/* Rankings Header */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Ranking List Skeleton */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="w-full h-16 rounded-xl" />
        ))}
      </div>
      </div>
    </div>
  );
}
