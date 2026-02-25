import { SettingsClient } from '@/components/settings-client';
import { getProfile } from '@/server';
import type { Metadata } from 'next';
import { signOut } from 'next-auth/react';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your Strive account and profile settings.',
};

export default async function SettingsPage() {
  const { data } = await getProfile();
  if (!data) {
    signOut({ callbackUrl: '/login' });
    return;
  }
  return (
    <div className="container mx-auto py-8">
      <SettingsClient user={data} />
    </div>
  );
}
