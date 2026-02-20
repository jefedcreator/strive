import Background from '@/components/background';
import NotificationsPageClient from '@/components/notifications-page-client';
import { getNotifications } from '@/server';
import type { PageProps } from '@/types';
import { loadParams } from '@/utils';

export default async function NotificationsPage({ searchParams }: PageProps) {
  const { type, query } = loadParams.parse(await searchParams);

  const initialData = await getNotifications({
    type: type ?? undefined,
    query: query ?? undefined,
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
