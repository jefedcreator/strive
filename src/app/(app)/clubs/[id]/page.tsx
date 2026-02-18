import { ClubDetailClient } from '@/components/club-detail-client';
import { getClub } from '@/server';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClubDetailPage({ params }: PageProps) {
  const { id } = await params;
  const initialData = await getClub(id);

  if (!initialData.data) {
    notFound();
  }

  return <ClubDetailClient initialData={initialData} />;
}
