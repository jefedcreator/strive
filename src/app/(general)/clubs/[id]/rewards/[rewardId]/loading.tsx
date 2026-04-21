import Background from '@/components/background';
import { Skeleton } from '@/primitives';

export default function Loading() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
      <Background />
      <div className="z-10 w-full max-w-lg mx-auto bg-card-light dark:bg-card-dark rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
        {/* Badge Image Skeleton */}
        <Skeleton className="aspect-square w-full rounded-none opacity-50" />

        {/* Info Skeleton */}
        <div className="p-6 space-y-4">
          {/* Type pill Skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>

          {/* Title Skeleton */}
          <Skeleton className="h-8 w-3/4" />

          {/* Description Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* Earned by Skeleton */}
          <div className="flex items-center gap-3 pt-2">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2 flex flex-col">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>

          {/* Context box Skeleton */}
          <div className="rounded-xl p-3 border border-gray-100 dark:border-gray-800 space-y-2 flex flex-col">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>

          {/* Actions Skeleton */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
          </div>
        </div>

        {/* CTA Bar Skeleton */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-primary/5 flex items-center justify-between">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}
