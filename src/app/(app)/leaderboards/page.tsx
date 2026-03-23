import Background from '@/components/background';
import { LeaderboardsPageClient } from '@/components/leaderboards-page-client';
import { getLeaderboards } from '@/server';
import type { PageProps } from '@/types';
import { loadLeaderboardsParams } from '@/utils';

export default async function LeaderboardsPage({ searchParams }: PageProps) {
  const { isActive, isPublic, query, page } = loadLeaderboardsParams.parse(
    await searchParams
  );

  const initialData = await getLeaderboards({
    isActive,
    isPublic,
    query,
    page,
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
