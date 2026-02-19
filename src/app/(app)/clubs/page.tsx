import { ClubsPageClient } from '@/components/clubs-page-client';
import { getClubs } from '@/server';
import Background from '@/components/background';
import type { SearchParams } from 'nuqs/server';
import { loadParams } from '@/utils';
import type { PageProps } from '@/types';



export default async function ClubsPage({searchParams}:PageProps) {
  const { isActive, isPublic } = loadParams.parse(await searchParams);

  const initialData = await getClubs({
       isActive: isActive ?? undefined,
    isPublic: isPublic ?? undefined,
  });

  return (
    <div className="relative">
      <Background />
      <ClubsPageClient currentFilters={{ isActive, isPublic }} initialData={initialData} />
    </div>
  );
}
