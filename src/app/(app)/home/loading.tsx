import { Skeleton } from '@/primitives';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-10 animate-in fade-in duration-500">
      {/* Welcome Message Skeleton */}
      <section className="mt-16 lg:mt-0 px-0 space-y-2">
        <Skeleton className="h-10 w-64 md:h-12" />
        <Skeleton className="h-5 w-80 md:w-96" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-2 space-y-8">
          {/* Last Run Card Skeleton */}
          <Skeleton className="w-full h-48 rounded-3xl" />

          {/* Leaderboard Table Skeleton */}
          <div className="bg-card-light dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden">
            <div className="p-8 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="px-8 pb-8 space-y-4">
              <div className="flex border-b border-gray-100 dark:border-gray-800 pb-4">
                <Skeleton className="h-4 w-12 mr-8" />
                <Skeleton className="h-4 w-32 mr-8" />
                <Skeleton className="h-4 w-24 mr-8" />
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center py-4">
                  <Skeleton className="w-8 h-8 rounded-full mr-8" />
                  <div className="flex items-center gap-3 mr-8">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16 mr-8" />
                  <Skeleton className="h-4 w-12 ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="space-y-8">
          {/* Tier Preview Skeleton */}
          <div className="bg-card-light dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
            <div className="flex gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2 flex flex-col items-center">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          </div>

          {/* Notifications Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>

          {/* Quick Actions Skeleton */}
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>

          {/* Pro Insights CTA Skeleton */}
          <Skeleton className="h-48 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
