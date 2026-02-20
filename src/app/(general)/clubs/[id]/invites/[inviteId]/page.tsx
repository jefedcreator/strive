import Background from '@/components/background';
import InviteDetailClient from '@/components/invite-detail-client';
import { getClubInvite } from '@/server';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string; inviteId: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id, inviteId } = await params;
  const { data: invite } = await getClubInvite(id, inviteId);

  if (!invite) {
    return {
      title: 'Invite Not Found | Strive',
    };
  }

  const clubName = invite.club.name;
  const inviterName = invite.inviter?.fullname ?? 'Someone';
  const description = invite.club.description ?? `Join ${clubName} on Strive!`;
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://strive.vercel.app';
  const rawImage = invite.club.image ?? '/favicon.ico';
  const image = rawImage.startsWith('http') ? rawImage : `${baseUrl}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;

  return {
    title: `Join ${clubName} | Invited by ${inviterName}`,
    description,
    openGraph: {
      title: `You're invited to join ${clubName}`,
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
      title: `Join ${clubName} on Strive`,
      description,
      images: [image],
    },
  };
}

export default async function InviteDetailPage({ params }: PageProps) {
  const { id, inviteId } = await params;
  const initialData = await getClubInvite(id, inviteId);

  if (!initialData.data) {
    notFound();
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <Background />
      <div className="z-10 w-full max-w-2xl">
        <InviteDetailClient initialData={initialData} type="club" />
      </div>
    </div>
  );
}
