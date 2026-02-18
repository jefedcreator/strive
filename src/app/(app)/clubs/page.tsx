import { ClubsPageClient } from '@/components/clubs-page-client';
import { getClubs } from '@/server';



export default async function ClubsPage() {

  const initialData = await getClubs();

  return <ClubsPageClient initialData={initialData} />;
}
