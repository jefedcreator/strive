import Background from '@/components/background';
import InviteDetailClient from '@/components/invite-detail-client';
import { getLeaderboardInvite } from '@/server';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string; inviteId: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id, inviteId } = await params;
  const { data: invite } = await getLeaderboardInvite(id, inviteId);

  if (!invite) {
    return {
      title: 'Invite Not Found | Strive',
    };
  }

  const leaderboardName = invite.leaderboard.name;
  const inviterName = invite.inviter?.fullname ?? 'Someone';
  const description =
    invite.leaderboard.description ?? `Join ${leaderboardName} on Strive!`;
  const image = `/api/og/leaderboard?name=${encodeURIComponent(leaderboardName)}`;

  return {
    title: `Join ${leaderboardName} | Invited by ${inviterName}`,
    description,
    openGraph: {
      title: `You're invited to join ${leaderboardName}`,
      description,
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
      title: `Join ${leaderboardName} on Strive`,
      description,
      images: [image],
    },
  };
}

export default async function InviteDetailPage({ params }: PageProps) {
  const { id, inviteId } = await params;
  const initialData = await getLeaderboardInvite(id, inviteId);

  if (!initialData.data) {
    notFound();
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <Background />
      <div className="z-10 w-full max-w-2xl">
        <InviteDetailClient initialData={initialData} type="leaderboard" />
      </div>
    </div>
  );
}
