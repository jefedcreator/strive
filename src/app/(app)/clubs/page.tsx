import { ClubsPageClient } from '@/components/clubs-page-client';
import { getClubs } from '@/server';
import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';



export default async function ClubsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const initialData = await getClubs();

  return <ClubsPageClient initialData={initialData} />;
}
