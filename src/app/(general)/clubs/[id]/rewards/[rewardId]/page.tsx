import Background from '@/components/background';
import { BadgeShareClient } from '@/components/badge-share-client';
import { getClubReward } from '@/server';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/server/auth';

interface PageProps {
  params: Promise<{ id: string; rewardId: string }>;
}

function buildBadgeImageUrl(reward: {
  type: string;
  title: string;
  description: string | null;
  milestone: number | null;
}) {
  const badgeType = 'club'; // Club milestones always use club badge type

  const params = new URLSearchParams({
    type: badgeType,
    title: reward.title,
    ...(reward.description ? { subtitle: reward.description } : {}),
    ...(reward.milestone ? { milestone: String(reward.milestone) } : {}),
  });

  return `/api/rewards/badge?${params.toString()}`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id, rewardId } = await params;
  const { data } = await getClubReward(id, rewardId);

  if (!data) {
    return { title: 'Badge Not Found | Strive' };
  }

  const clubName = data.club.name;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://usestrive.run/';

  const ogParams = new URLSearchParams({
    type: 'club',
    title: data.title,
    username: clubName,
    context: 'club',
    ...(data.description ? { subtitle: data.description } : {}),
    ...(data.milestone ? { milestone: String(data.milestone) } : {}),
  });

  const imageUrl = `${baseUrl}/api/rewards/og?${ogParams.toString()}`;
  const description = data.description ?? `${clubName} earned "${data.title}" on Strive`;

  return {
    metadataBase: new URL(baseUrl),
    title: `${data.title} — Earned by ${clubName} | Strive`,
    description,
    openGraph: {
      title: `${clubName} hit a milestone: "${data.title}"`,
      description,
      images: [imageUrl],
      type: 'website',
      siteName: 'Strive',
      url: `${baseUrl}/clubs/${id}/rewards/${rewardId}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${clubName} hit a milestone: "${data.title}" on Strive`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ClubBadgePage({ params }: PageProps) {
  const { id, rewardId } = await params;
  const { data } = await getClubReward(id, rewardId);
  const session = await auth();

  if (!data) {
    notFound();
  }

  const badgeUrl = buildBadgeImageUrl(data);
  // For club milestones, the "earner" is the club itself
  const username = data.club.name;
  
  // A user can download if they are a member of the club
  // We'll simplify this by checking if they are logged in for now, 
  // or we could do a DB check if strictly required.
  const canDownload = !!session?.user?.id;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <Background />
      <div className="z-10 w-full max-w-lg">
        <BadgeShareClient
          badge={{
            id: data.id,
            type: data.type,
            title: data.title,
            description: data.description,
            earnedAt: data.createdAt,
            username,
            userAvatar: data.club.image,
            badgeUrl,
            milestone: data.milestone,
            leaderboardName: null,
            clubName: data.club.name,
          }}
          canDownload={canDownload}
        />
      </div>
    </div>
  );
}
