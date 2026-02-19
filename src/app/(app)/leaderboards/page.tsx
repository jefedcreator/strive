import { LeaderboardsPageClient } from '@/components/leaderboards-page-client';
import { getLeaderboards } from '@/server';
import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';
import Background from '@/components/background';

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function LeaderboardsPage({ searchParams }: PageProps) {
  const session = await auth();

  // if (!session?.user) {
  //   redirect('/');
  // }

  const { tab } = await searchParams;

  const params: Record<string, any> = {};
  if (tab === 'active') params.isActive = true;
  else if (tab === 'inactive') params.isActive = false;
  else if (tab === 'public') params.isPublic = true;
  else if (tab === 'private') params.isPublic = false;

  const initialData = await getLeaderboards(params);

  return (
    <div className="relative">
      <Background />
      <LeaderboardsPageClient initialData={initialData} />
    </div>
  );
}
