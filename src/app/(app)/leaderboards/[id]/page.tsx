import { LeaderboardDetailClient } from '@/components/leaderboard-detail-client';
import { getLeaderboard } from '@/server';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LeaderboardDetailPage({ params }: PageProps) {
  const { id } = await params;
  const initialData = await getLeaderboard(id);

  if (!initialData.data) {
    notFound();
  }

  return <LeaderboardDetailClient initialData={initialData} />;
}
