import { LeaderboardsPageClient } from '@/components/leaderboards-page-client';
import { getLeaderboards } from '@/server';
import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';
import Background from '@/components/background';


export default async function LeaderboardsPage() {
  const session = await auth();
console.log('session',session);

  // if (!session?.user) {
  //   redirect('/');
  // }

  const initialData = await getLeaderboards();

  return (
    <div className="relative">
      <Background />
      <LeaderboardsPageClient initialData={initialData} />
    </div>
  );
}
