import Background from '@/components/background';
import { LeaderboardsPageClient } from '@/components/leaderboards-page-client';
import { getLeaderboards } from '@/server';
import type { PageProps } from '@/types';
import { loadParams } from '@/utils';



export default async function LeaderboardsPage({ searchParams }: PageProps) {
  const { isActive, isPublic, query } = loadParams.parse(await searchParams);

  const initialData = await getLeaderboards({
    isActive: isActive ?? undefined,
    isPublic: isPublic ?? undefined,
    query: query ?? undefined,
  });

  return (
    <div className="relative">
      <Background />
      <LeaderboardsPageClient currentFilters={{ isActive, isPublic, query }} initialData={initialData} />
    </div>
  );
}
