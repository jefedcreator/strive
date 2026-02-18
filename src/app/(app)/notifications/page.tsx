import { getNotifications } from '@/server';
import NotificationsPageClient from '@/components/notifications-page-client';
import Background from '@/components/background';

export default async function NotificationsPage() {
  const initialData = await getNotifications();

  return (
    <div className="relative">
      <Background />
      <NotificationsPageClient initialData={initialData} />
    </div>
  );
}
