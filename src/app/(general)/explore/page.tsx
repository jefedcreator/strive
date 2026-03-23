import type { Metadata } from 'next';
import Background from '@/components/background';
import { ExplorePageClient } from '@/components/explore-page-client';
import { getExploreItems } from '@/server';
import type { PageProps } from '@/types';
import { loadExploreParams } from '@/utils';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://usestrive.run';
  const pageUrl = `${baseUrl}/explore`;
  const imageUrl = `${baseUrl}/api/og?name=Explore%20Strive&type=explore`;

  return {
    title: 'Explore',
    description:
      'Discover the most active clubs and competitive leaderboards on Strive.',
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: 'Explore | Strive',
      description:
        'Discover the most active clubs and competitive leaderboards on Strive.',
      url: pageUrl,
      siteName: 'Strive',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          alt: 'Explore Strive',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Explore | Strive',
      description:
        'Discover the most active clubs and competitive leaderboards on Strive.',
      images: [imageUrl],
    },
  };
}

export default async function ExplorePage({ searchParams }: PageProps) {
  const { query, page, type } = loadExploreParams.parse(await searchParams);

  const initialData = await getExploreItems({
    query,
    page,
    type,
  });

  // await new Promise(resolve => setTimeout(resolve, 1000000));

  return (
    <div className="relative">
      <Background />
      <div className="container mx-auto max-w-7xl px-4 py-12 md:py-20 min-h-screen">
        <ExplorePageClient
          currentFilters={{ query, page, type: type }}
          initialData={initialData}
        />
      </div>
    </div>
  );
}
