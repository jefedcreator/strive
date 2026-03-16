import Background from '@/components/background';
import { BadgeShareClient } from '@/components/badge-share-client';
import { db } from '@/server/db';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/server/auth';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getBadge(userRewardId: string) {
  try {
    const userReward = await db.userReward.findUnique({
      where: { id: userRewardId },
      include: {
        user: {
          select: {
            fullname: true,
            username: true,
            avatar: true,
          },
        },
        reward: {
          include: {
            leaderboard: { select: { name: true } },
            club: { select: { name: true } },
          },
        },
      },
    });

    return userReward;
  } catch {
    return null;
  }
}

function buildBadgeImageUrl(reward: {
  type: string;
  title: string;
  description: string | null;
  milestone: number | null;
}) {
  const badgeType =
    reward.type === 'GOLD'
      ? 'gold'
      : reward.type === 'SILVER'
        ? 'silver'
        : reward.type === 'BRONZE'
          ? 'bronze'
          : 'club';

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
  const { id } = await params;
  const data = await getBadge(id);

  if (!data) {
    return { title: 'Badge Not Found | Strive' };
  }

  const username = data.user.fullname ?? data.user.username ?? 'Runner';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://usestrive.run/';

  const badgeType =
    data.reward.type === 'GOLD'
      ? 'gold'
      : data.reward.type === 'SILVER'
        ? 'silver'
        : data.reward.type === 'BRONZE'
          ? 'bronze'
          : 'club';

  const ogParams = new URLSearchParams({
    type: badgeType,
    title: data.reward.title,
    username,
    context: data.reward.leaderboard?.name ? 'leaderboard' : 'challenge',
    ...(data.reward.description ? { subtitle: data.reward.description } : {}),
    ...(data.reward.milestone
      ? { milestone: String(data.reward.milestone) }
      : {}),
  });

  const imageUrl = `${baseUrl}/api/rewards/og?${ogParams.toString()}`;

  const description =
    data.reward.description ??
    `${username} earned "${data.reward.title}" on Strive`;

  return {
    metadataBase: new URL(baseUrl),
    title: `${data.reward.title} — Earned by ${username} | Strive`,
    description,
    openGraph: {
      title: `${username} earned "${data.reward.title}"`,
      description,
      images: [imageUrl],
      type: 'website',
      siteName: 'Strive',
      url: `${baseUrl}/rewards/${id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${username} earned "${data.reward.title}" on Strive`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function BadgeSharePage({ params }: PageProps) {
  const { id } = await params;
  const data = await getBadge(id);
  const session = await auth();

  if (!data) {
    notFound();
  }

  const badgeUrl = buildBadgeImageUrl(data.reward);
  const username = data.user.fullname ?? data.user.username ?? 'Runner';
  const canDownload = !!session?.user?.id && session.user.id === data.userId;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <Background />
      <div className="z-10 w-full max-w-lg">
        <BadgeShareClient
          badge={{
            id: data.id,
            type: data.reward.type,
            title: data.reward.title,
            description: data.reward.description,
            earnedAt: data.earnedAt.toISOString(),
            username,
            userAvatar: data.user.avatar,
            badgeUrl,
            milestone: data.reward.milestone,
            leaderboardName: data.reward.leaderboard?.name ?? null,
            clubName: data.reward.club?.name ?? null,
          }}
          canDownload={canDownload}
        />
      </div>
    </div>
  );
}
