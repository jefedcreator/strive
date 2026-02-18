import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { LeaderboardsPageClient } from '@/components/leaderboards-page-client';
import { type PaginatedApiResponse, type LeaderboardListItem } from '@/types';
import { type LeaderboardQueryValidatorSchema } from '@/backend/validators/leaderboard.validator';

async function getLeaderboards(
  params?: Partial<LeaderboardQueryValidatorSchema>
): Promise<PaginatedApiResponse<LeaderboardListItem[]>> {
  try {
    const headersList = await headers();
    const cookie = headersList.get('cookie') ?? '';

    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, String(value));
        }
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const url = `${baseUrl}/api/leaderboards${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    const res = await fetch(url, {
      headers: { cookie },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch leaderboards: ${res.statusText}`);
    }

    return res.json() as Promise<PaginatedApiResponse<LeaderboardListItem[]>>;
  } catch (error) {
    console.error('Error fetching leaderboards:', error);
    return {
      status: 500,
      message: 'Failed to fetch leaderboards',
      data: [],
      total: 0,
      page: 1,
      size: 1,
      totalPages: 0,
    };
  }
}

export default async function LeaderboardsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const initialData = await getLeaderboards();

  return <LeaderboardsPageClient initialData={initialData} />;
}
