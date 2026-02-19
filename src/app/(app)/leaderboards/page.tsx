import { LeaderboardsPageClient } from '@/components/leaderboards-page-client';
import { getLeaderboards } from '@/server';
import { auth } from '@/server/auth';
import Background from '@/components/background';
import { loadLeaderboardSearchParams } from '@/components/leaderboards/searchparams';
import type { SearchParams } from 'nuqs/server';

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function LeaderboardsPage({ searchParams }: PageProps) {
  const session = await auth();
  const { isActive, isPublic } = loadLeaderboardSearchParams.parse(await searchParams);

  const initialData = await getLeaderboards({
    isActive: isActive ?? undefined,
    isPublic: isPublic ?? undefined,
  });

  console.log('initialData',initialData);
  

  return (
    <div className="relative">
      <Background />
      <LeaderboardsPageClient currentFilters={{ isActive, isPublic }} initialData={initialData} />
    </div>
  );
}
