import { Skeleton } from '@/primitives';

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen animate-in fade-in duration-500 overflow-hidden">
      {/* Navbar Skeleton */}
      <div className="fixed top-0 w-full h-20 border-b border-gray-100 dark:border-white/5 bg-white/70 dark:bg-[#06080D]/70 backdrop-blur-md z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      </div>

      <div className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          {/* Badge/Pill Skeleton */}
          <div className="flex justify-center">
            <Skeleton className="h-8 w-64 rounded-full" />
          </div>

          {/* Hero Heading Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-16 md:h-24 w-3/4 mx-auto" />
            <Skeleton className="h-16 md:h-24 w-2/3 mx-auto" />
          </div>

          {/* Subtext Skeleton */}
          <div className="space-y-2 max-w-2xl mx-auto">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-4/5 mx-auto" />
          </div>

          {/* CTA Buttons Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Skeleton className="h-14 w-48 rounded-full" />
            <Skeleton className="h-14 w-48 rounded-full" />
          </div>

          {/* Large Dashboard Image Skeleton */}
          <div className="mt-24 max-w-5xl mx-auto">
            <Skeleton className="aspect-video w-full rounded-[2.5rem]" />
          </div>
        </div>
      </div>

      {/* Integration Logos Bar Skeleton */}
      <div className="py-16 border-y border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 flex justify-center gap-16 md:gap-24">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Feature Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-8 bg-gray-50 dark:bg-[#121826] rounded-[2rem] space-y-4">
              <Skeleton className="h-14 w-14 rounded-2xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
