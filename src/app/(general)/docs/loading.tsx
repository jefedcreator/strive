import { Skeleton } from '@/primitives';

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen animate-in fade-in duration-500 max-w-7xl mx-auto py-12 px-4 space-y-8">
      {/* Swagger UI Header Skeleton */}
      <div className="space-y-4 pt-10">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-1/3" />
      </div>

      {/* API Sections Skeleton */}
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col gap-4 p-4 border border-gray-100 dark:border-white/5 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-16 rounded" />
                <Skeleton className="h-5 w-48 rounded" />
              </div>
              <Skeleton className="h-4 w-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
