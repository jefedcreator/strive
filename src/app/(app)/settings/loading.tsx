import { Skeleton } from '@/primitives';

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in duration-500 py-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-32 md:h-12" />
          <Skeleton className="h-5 w-64 md:w-80" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Main Settings Card Skeleton */}
      <div className="bg-card-light dark:bg-card-dark rounded-2xl w-full flex md:flex-row flex-col justify-between border border-gray-200 dark:border-gray-800 p-6 shadow-sm gap-8">
        {/* Profile Photo Section Skeleton */}
        <div className="space-y-4 flex flex-col items-center md:items-start">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="w-32 h-32 rounded-full" />
          <Skeleton className="h-3 w-40" />
        </div>

        {/* Form Section Skeleton */}
        <div className="space-y-6 w-full md:w-2/3 flex flex-col">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <Skeleton className="h-11 w-32 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
