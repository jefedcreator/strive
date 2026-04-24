import Background from '@/components/background';
import { BadgeShareClient } from '@/components/badge-share-client';
import { ClaimBadgeButton } from '@/components/claim-badge-button';
import { Button } from '@/primitives/Button';
import { getBadge } from '@/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { LogIn } from 'lucide-react';
import { type Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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
  const { id } = await params;
  const { data } = await getBadge(id);

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
    ...(data.club.image ? { image: data.club.image } : {}),
  });

  const imageUrl = `${baseUrl}/api/rewards/og?${ogParams.toString()}`;
  const description =
    data.description ?? `${clubName} earned "${data.title}" on Strive`;

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
      url: `${baseUrl}/badges/${id}`,
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
  const { id } = await params;
  const { data } = await getBadge(id);
  const session = await auth();

  if (!data) {
    notFound();
  }

  const userId = session?.user?.id;

  const badgeUrl = buildBadgeImageUrl(data);
  const username = data.club.name;

  let contextualActions: React.ReactNode = null;

  if (!userId || data.isExpired) {
    contextualActions = (
      <Button asChild className="w-full h-12 text-sm font-bold gap-2">
        <Link href={`/login?rewardId=${id}&callbackUrl=/badges/${id}`}>
          <LogIn className="w-4 h-4" />
          Login to Claim
        </Link>
      </Button>
    );
  } else if (!data.isMember) {
    contextualActions = (
      <ClaimBadgeButton rewardId={id} label="Join Club & Claim" />
    );
  } else if (!data.isClaimed) {
    contextualActions = <ClaimBadgeButton rewardId={id} />;
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
          canDownload={data.isClaimed}
          actions={contextualActions}
        />
      </div>
    </div>
  );
}
