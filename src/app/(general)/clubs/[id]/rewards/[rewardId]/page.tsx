import Background from '@/components/background';
import { BadgeShareClient } from '@/components/badge-share-client';
import { getClubReward } from '@/server';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { ClaimBadgeButton } from '@/components/claim-badge-button';

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
  
  // can download only if claimed
  const canDownload = hasClaimed;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <Background />
      <div className="z-10 w-full max-w-lg space-y-6">
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

        {isMember && !hasClaimed && (
          <ClaimBadgeButton clubId={id} rewardId={rewardId} />
        )}
        
        {hasClaimed && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-center">
            <p className="text-green-600 dark:text-green-400 text-sm font-bold flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              You have claimed this badge!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
