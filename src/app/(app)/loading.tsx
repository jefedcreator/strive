import { Skeleton } from '@/primitives';

export default function Loading() {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="mb-6 md:mb-10 mt-16 lg:mt-0 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
