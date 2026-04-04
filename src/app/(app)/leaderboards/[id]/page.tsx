import { LeaderboardDetailClient } from '@/components/leaderboard-detail-client';
import { getLeaderboard } from '@/server';
import { notFound } from 'next/navigation';
import Background from '@/components/background';
import { type Metadata } from 'next';
import { loadLeaderboardParams } from '@/utils';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { data: leaderboard } = await getLeaderboard(id);

  if (!leaderboard) {
    return {
      title: 'Leaderboard Not Found | Strive',
    };
  }

  const leaderboardName = `${leaderboard.name}`;
  const description =
    leaderboard.description ?? `Check out ${leaderboardName} on Strive!`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://usestrive.run';
  const pageUrl = `${baseUrl}/leaderboards/${id}`;

  // Dynamic OG image showing actual leaderboard rankings
  const ogImageUrl = `${baseUrl}/api/leaderboards/${id}/og`;

  // Use club image if available, else the dynamic leaderboard OG
  const clubImage = leaderboard.club?.image;
  const image = clubImage
    ? clubImage.startsWith('http')
      ? clubImage
      : `${baseUrl}${clubImage.startsWith('/') ? '' : '/'}${clubImage}`
    : ogImageUrl;

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

export default async function LeaderboardDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { sortBy } = loadLeaderboardParams.parse(
    await searchParams
  );

  const initialData = await getLeaderboard(id, {sortBy});

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
