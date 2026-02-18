import { LeaderboardsPageClient } from '@/components/leaderboards-page-client';
import { getLeaderboards } from '@/server';


export default async function LeaderboardsPage() {

  const initialData = await getLeaderboards();

  return <LeaderboardsPageClient initialData={initialData} />;
}
