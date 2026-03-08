import { ClubDetailClient } from '@/components/club-detail-client';
import { getClub } from '@/server';
import { notFound } from 'next/navigation';
import Background from '@/components/background';
import { type Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { data: club } = await getClub(id);

  if (!club) {
    return {
      title: 'Club Not Found | Strive',
    };
  }

  const clubName = club.name;
  const description = club.description ?? `Check out ${clubName} on Strive!`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://usestrive.run';
  const imageUrl = `${baseUrl}/api/og?name=${encodeURIComponent(clubName)}&type=club`;

  const rawImage = club.image ?? imageUrl ?? '/favicon.ico';
  const image = rawImage.startsWith('http')
    ? rawImage
    : `${baseUrl}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;

  return {
    title: `${clubName} | Strive`,
    description,
    openGraph: {
      title: clubName,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: clubName,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: clubName,
      description,
      images: [image],
    },
  };
}

export default async function ClubDetailPage({ params }: PageProps) {
  const { id } = await params;
  const initialData = await getClub(id);

  if (!initialData.data) {
    notFound();
  }

  return (
    <div className="relative">
      <Background />
      <ClubDetailClient initialData={initialData} />
    </div>
  );
}
