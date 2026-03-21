import { ClubsPageClient } from '@/components/clubs-page-client';
import { getClubs } from '@/server';
import Background from '@/components/background';
import { loadClubsParams } from '@/utils';
import type { PageProps } from '@/types';

export default async function ClubsPage({ searchParams }: PageProps) {
  const { isActive, isPublic, query } = loadClubsParams.parse(await searchParams);

  const initialData = await getClubs({
    isActive: isActive ?? undefined,
    isPublic: isPublic ?? undefined,
    query: query ?? undefined,
  });

  return (
    <div className="relative">
      <Background />
      <ClubsPageClient
        currentFilters={{ isActive, isPublic, query }}
        initialData={initialData}
      />
    </div>
  );
}
