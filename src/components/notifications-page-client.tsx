'use client';

import { FadeInItem, FadeInStagger } from '@/components/fade-in';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/primitives/Tabs';
import {
  type FilterOption,
  type NotificationWithRelations,
  type PaginatedApiResponse,
} from '@/types';
import { parseParams } from '@/utils';
import { Search, SearchX } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useQueryStates } from 'nuqs';
import { useMemo, useState } from 'react';
import { NotificationCard } from './notification-card';

interface NotificationsPageClientProps {
  initialData: PaginatedApiResponse<NotificationWithRelations[]>;
  currentFilters: {
    type: string | null;
    query: string | null;
  };
}

const NotificationsPageClient: React.FC<NotificationsPageClientProps> = ({
  initialData: notificationsResponse,
  currentFilters,
}) => {
  const { data: session } = useSession();
  const [{ type, query }, setStates] = useQueryStates(parseParams, {
    shallow: false,
    throttleMs: 1000,
  });

  const tab = useMemo(() => {
    if (type === 'info') return 'info';
    if (type === 'club') return 'club';
    if (type === 'leaderboard') return 'leaderboard';
    return 'all';
  }, [type]);

  const isLoading =
    type !== currentFilters.type || query !== currentFilters.query;

  // const { data: notificationsResponse } = useQuery<
  //   PaginatedApiResponse<NotificationWithRelations[]>
  // >({
  //   queryKey: ['notifications'],
  //   queryFn: async () => {
  //     const { data } = await axios.get<
  //       PaginatedApiResponse<NotificationWithRelations[]>
  //     >('/api/notifications', {
  //       headers: { Authorization: `Bearer ${session?.user.token}` },
  //     });
  //     return data;
  //   },
  //   initialData,
  //   staleTime: Infinity,
  // });

  const notifications = notificationsResponse.data;

  // const todayNotifications = useMemo(() => {
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);
  //   return filteredNotifications.filter((n) => new Date(n.createdAt) >= today);
  // }, [filteredNotifications]);

  // const olderNotifications = useMemo(() => {
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);
  //   return filteredNotifications.filter((n) => new Date(n.createdAt) < today);
  // }, [filteredNotifications]);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 md:mb-8 mt-16 lg:mt-0">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          My Notifications
        </h2>
        <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-500 dark:text-gray-400">
          Stay updated with your latest activities, club invites, and records.
        </p>
      </div>

      <div className="relative mb-6">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <Search className="w-5 h-5 text-gray-400" />
        </span>
        <input
          type="text"
          value={query ?? ''}
          onChange={(e) => setStates({ query: e.target.value || null })}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark text-sm focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 shadow-sm transition-shadow"
          placeholder="Search your notifications..."
        />
      </div>

      <Tabs
        value={tab}
        className="flex flex-col w-full min-w-0"
        onValueChange={(value) => {
          if (value === 'info') void setStates({ type: 'info' });
          else if (value === 'club') void setStates({ type: 'club' });
          else if (value === 'leaderboard')
            void setStates({ type: 'leaderboard' });
          else void setStates({ type: null });
        }}
      >
        <TabsList className="mb-8">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="club">Club</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-6 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Notification Feed */}
            <div className="lg:col-span-2 space-y-4">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 pb-20 md:pb-0">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 h-[220px] animate-pulse"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-gray-700" />
                        <div className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 w-20 h-6" />
                      </div>
                      <div className="space-y-3">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !isLoading && notifications.length > 0 ? (
                <FadeInStagger className="space-y-4">
                  {notifications.map((notification) => (
                    <FadeInItem key={notification.id}>
                      <NotificationCard notification={notification} />
                    </FadeInItem>
                  ))}
                </FadeInStagger>
              ) : !isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <SearchX className="w-10 h-10 mb-2 opacity-50 text-gray-400 dark:text-gray-500" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    No notifications found
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                    Try adjusting your filters or search term.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsPageClient;
