import { LeaderboardDetailClient } from '@/components/leaderboard-detail-client';
import { getLeaderboard } from '@/server';
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
  const { data: leaderboard } = await getLeaderboard(id);

  if (!leaderboard) {
    return {
      title: 'Leaderboard Not Found',
    };
  }

  const leaderboardName = `${leaderboard.name}`;
  const description =
    leaderboard.description ?? `Check out ${leaderboardName} on Strive!`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://usestrive.run';
  const pageUrl = `${baseUrl}/leaderboards/${id}`;
  const imageUrl = `${baseUrl}/api/og?name=${encodeURIComponent(leaderboardName)}&type=leaderboard`;

  // Use club image if available, else og template
  const rawImage = leaderboard.club?.image ?? imageUrl;
  const image = rawImage.startsWith('http')
    ? rawImage
    : `${baseUrl}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;

  return {
    title: leaderboardName,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: leaderboardName,
      description,
      url: pageUrl,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: leaderboardName,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: leaderboardName,
      description,
      images: [image],
    },
  };
}

export default async function LeaderboardDetailPage({ params }: PageProps) {
  const { id } = await params;
  const initialData = await getLeaderboard(id);

  if (!initialData.data) {
    notFound();
  }

  return (
    <div className="relative w-full min-w-0 flex flex-col">
      <Background />
      <LeaderboardDetailClient initialData={initialData} />
    </div>
  );
}
