import Background from '@/components/background';
import { LeaderboardsPageClient } from '@/components/leaderboards-page-client';
import { getLeaderboards } from '@/server';
import type { PageProps } from '@/types';
import { loadParams } from '@/utils';

export default async function LeaderboardsPage({ searchParams }: PageProps) {
  const { isActive, isPublic, query, page } = loadParams.parse(
    await searchParams
  );

  const initialData = await getLeaderboards({
    isActive: isActive ?? undefined,
    isPublic: isPublic ?? undefined,
    query: query ?? undefined,
    page: page ?? undefined,
    // size:5
  });

  return (
    <div className="relative">
      <Background />
      <LeaderboardsPageClient
        currentFilters={{ isActive, isPublic, query, page }}
        initialData={initialData}
      />
    </div>
  );
}
