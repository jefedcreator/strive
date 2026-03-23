import Background from '@/components/background';
import NotificationsPageClient from '@/components/notifications-page-client';
import { getNotifications } from '@/server';
import type { PageProps } from '@/types';
import { loadNotificationParams } from '@/utils';

export default async function NotificationsPage({ searchParams }: PageProps) {
  const { type, query, page } = loadNotificationParams.parse(
    await searchParams
  );

  const initialData = await getNotifications({
    type,
    query,
    page,
  });

  return (
    <div className="relative">
      <Background />
      <NotificationsPageClient
        initialData={initialData}
        currentFilters={{
          type,
          query,
        }}
      />
    </div>
  );
}
