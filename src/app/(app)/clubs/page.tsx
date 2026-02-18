import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { ClubsPageClient } from '@/components/clubs-page-client';
import { type PaginatedApiResponse, type ClubListItem } from '@/types';
import { type ClubQueryValidatorSchema } from '@/backend/validators/club.validator';

async function getClubs(
  params?: Partial<ClubQueryValidatorSchema>
): Promise<PaginatedApiResponse<ClubListItem[]>> {
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
    const url = `${baseUrl}/api/clubs${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    const res = await fetch(url, {
      headers: { cookie },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch clubs: ${res.statusText}`);
    }

    return res.json() as Promise<PaginatedApiResponse<ClubListItem[]>>;
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return {
      status: 500,
      message: 'Failed to fetch clubs',
      data: [],
      total: 0,
      page: 1,
      size: 1,
      totalPages: 0,
    };
  }
}

export default async function ClubsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const initialData = await getClubs();

  return <ClubsPageClient initialData={initialData} />;
}
