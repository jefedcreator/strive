import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';
import { getNotifications } from '@/server';
import NotificationsPageClient from '@/components/notifications-page-client';

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const initialData = await getNotifications();

  return <NotificationsPageClient initialData={initialData} />;
}
