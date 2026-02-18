import { LeaderboardsPageClient } from '@/components/leaderboards-page-client';
import { getLeaderboards } from '@/server';
import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';


export default async function LeaderboardsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const initialData = await getLeaderboards();

  return <LeaderboardsPageClient initialData={initialData} />;
}
