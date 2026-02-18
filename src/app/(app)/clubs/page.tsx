import { ClubsPageClient } from '@/components/clubs-page-client';
import { getClubs } from '@/server';
import Background from '@/components/background';


export default async function ClubsPage() {

  const initialData = await getClubs();

  return (
    <div className="relative">
      <Background />
      <ClubsPageClient initialData={initialData} />
    </div>
  );
}
