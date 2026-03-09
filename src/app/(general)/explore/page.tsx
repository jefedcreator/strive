import Background from '@/components/background';
import { ExplorePageClient } from '@/components/explore-page-client';
import { getExploreItems } from '@/server';
import type { PageProps } from '@/types';
import { loadParams } from '@/utils';

export default async function ExplorePage({ searchParams }: PageProps) {
  const { query, page, type } = loadParams.parse(
    await searchParams
  );

  const initialData = await getExploreItems({
    query: query ?? undefined,
    page: page ?? undefined,
    type: (type as 'clubs' | 'leaderboards') ?? undefined,
  });

  return (
    <div className="relative">
      <Background />
      <ExplorePageClient
        currentFilters={{ query, page, type: type as 'clubs' | 'leaderboards' | null }}
        initialData={initialData}
      />
    </div>
  );
}
