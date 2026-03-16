import Background from '@/components/background';
import { Skeleton } from '@/primitives';

export default function Loading() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 animate-in fade-in duration-700">
      <Background />
      <div className="z-10 w-full max-w-[420px] mx-auto">
        <div className="bg-card/80 backdrop-blur-2xl border border-white/10 dark:border-white/5 rounded-[2.5rem] p-8 shadow-2xl space-y-8">
          {/* Inviter Info Skeleton */}
          <div className="flex items-center space-x-3.5 bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-black/5 dark:border-white/5">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-1.5 flex flex-col">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Entity Image Skeleton */}
          <div className="relative w-full h-[220px] rounded-[1.5rem] overflow-hidden bg-muted/20">
            <Skeleton className="w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex flex-col justify-end p-6 space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>

          {/* Description Skeleton */}
          <div className="space-y-2 px-4 flex flex-col items-center">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* Actions Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-14 w-full rounded-2xl" />
            <Skeleton className="h-10 w-1/2 mx-auto rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
