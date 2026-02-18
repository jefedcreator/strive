import { getNotifications } from '@/server';
import NotificationsPageClient from '@/components/notifications-page-client';

export default async function NotificationsPage() {
  const initialData = await getNotifications();

  return <NotificationsPageClient initialData={initialData} />;
}
