import { Skeleton } from '@/primitives';

export default function Loading() {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 max-w-7xl mx-auto py-12 space-y-12">
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4 mx-auto md:mx-0" />
        <Skeleton className="h-6 w-1/2 mx-auto md:mx-0" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    </div>
  );
}
