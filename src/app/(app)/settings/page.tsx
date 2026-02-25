import Background from '@/components/background';
import { SettingsClient } from '@/components/settings-client';
import { getProfile } from '@/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your Strive account and profile settings.',
};

export default async function SettingsPage() {
  const { data } = await getProfile();
  if (!data) {
    redirect('/login');
  }
  return (
    <div className="relative">
      <Background />
      <div className="container mx-auto py-8">
        <SettingsClient user={data} />
      </div>
    </div>
  );
}
