import Background from '@/components/background';
import { BadgeShareClient } from '@/components/badge-share-client';
import { getClubReward } from '@/server';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { ClaimBadgeButton } from '@/components/claim-badge-button';
import Link from 'next/link';
import { LogIn, Users } from 'lucide-react';
import { Button } from '@/primitives/Button';

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

  const userId = session?.user?.id;
  
  // Check if user is a member
  const membership = userId ? await db.userClub.findUnique({
    where: { userId_clubId: { userId, clubId: id } },
  }) : null;
  
  const isMember = !!membership && membership.isActive;

  // Check if already claimed
  const userReward = userId ? await db.userReward.findUnique({
    where: { userId_rewardId: { userId, rewardId } },
  }) : null;
  
  const hasClaimed = !!userReward;

  const badgeUrl = buildBadgeImageUrl(data);
  const username = data.club.name;

  let contextualActions: React.ReactNode = null;

  if (!userId) {
    contextualActions = (
      <Button asChild className="w-full h-12 text-sm font-bold gap-2">
        <Link href={`/login?callbackUrl=/clubs/${id}/rewards/${rewardId}`}>
          <LogIn className="w-4 h-4" />
          Login to Claim
        </Link>
      </Button>
    );
  } else if (!isMember) {
    contextualActions = (
      <Button asChild variant="secondary" className="w-full h-12 text-sm font-bold gap-2">
        <Link href={`/login?clubs=${id}`}>
          <Users className="w-4 h-4" />
          Join Club to Claim
        </Link>
      </Button>
    );
  } else if (!hasClaimed) {
    contextualActions = <ClaimBadgeButton clubId={id} rewardId={rewardId} />;
  }

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
          canDownload={hasClaimed}
          actions={contextualActions}
        />
      </div>
    </div>
  );
}
