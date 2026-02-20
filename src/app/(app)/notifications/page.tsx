import Background from '@/components/background';
import NotificationsPageClient from '@/components/notifications-page-client';
import { getNotifications } from '@/server';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const initialData = await getNotifications();

  return (
    <div className="relative">
      <Background />
      <NotificationsPageClient initialData={initialData} />
    </div>
  );
}
