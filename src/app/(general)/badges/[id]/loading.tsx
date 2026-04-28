import Background from '@/components/background';
import { Skeleton } from '@/primitives';

export default function Loading() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <Background />
      <div className="z-10 w-full max-w-lg mx-auto bg-card-light dark:bg-card-dark rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
        {/* Badge Image Skeleton */}
        <div className="aspect-square w-full bg-gray-950 flex items-center justify-center">
          <Skeleton className="w-48 h-48 rounded-full opacity-10" />
        </div>

        {/* Info Skeleton */}
        <div className="p-6 space-y-4">
          {/* Type pill Skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-3 w-20 rounded-full" />
          </div>

          {/* Title Skeleton */}
          <Skeleton className="h-9 w-3/4" />

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
              <Skeleton className="h-3 w-32 opacity-60" />
            </div>
          </div>

          {/* Actions Skeleton */}
          <div className="pt-2">
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>

        {/* CTA Bar Skeleton */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-primary/5 flex items-center justify-between">
          <Skeleton className="h-3 w-32 rounded-full" />
          <Skeleton className="h-3 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}
