'use client';

import { FadeInItem, FadeInStagger } from '@/components/fade-in';
import { useInfiniteScroll } from '@/hooks/useinfiniteScroll';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/primitives/Tabs';
import {
  type NotificationWithRelations,
  type PaginatedApiResponse,
} from '@/types';
import { notificationParams } from '@/utils';
import { Loader2, Search, SearchX } from 'lucide-react';
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
  const [{ type, query, page }, setStates] = useQueryStates(
    notificationParams,
    {
      shallow: false,
      throttleMs: 1000,
    }
  );
  const [refreshKey, setRefreshKey] = useState(0);

  const { items, ref, hasNextPage } = useInfiniteScroll({
    data: notificationsResponse,
    page: page ?? 1,
    setPage: (p) => setStates({ page: p }),
    refresh: refreshKey,
  });

  const tab = useMemo(() => {
    if (type === 'info') return 'info';
    if (type === 'club') return 'club';
    if (type === 'leaderboard') return 'leaderboard';
    if (type === 'reward') return 'reward';
    return 'all';
  }, [type]);

  const isLoading =
    type !== currentFilters.type || query !== currentFilters.query;

  const handleTabClick = (value: string) => {
    if (tab === value) {
      void setStates({ page: null });
    }
  };

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
          onChange={(e) =>
            setStates({ query: e.target.value || null, page: 1 })
          }
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark text-sm focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 shadow-sm transition-shadow"
          placeholder="Search your notifications..."
        />
      </div>

      <Tabs
        value={tab}
        className="flex flex-col w-full min-w-0"
        onValueChange={(value) => {
          if (value === 'info') void setStates({ type: 'info', page: 1 });
          else if (value === 'club') void setStates({ type: 'club', page: 1 });
          else if (value === 'leaderboard')
            void setStates({ type: 'leaderboard', page: 1 });
          else void setStates({ type: null, page: 1 });
        }}
      >
        <TabsList className="mb-8 sticky top-[64px] z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md py-2">
          <TabsTrigger value="all" onClick={() => handleTabClick('all')}>
            All
          </TabsTrigger>
          <TabsTrigger value="info" onClick={() => handleTabClick('info')}>
            Info
          </TabsTrigger>
          <TabsTrigger value="club" onClick={() => handleTabClick('club')}>
            Club
          </TabsTrigger>
          <TabsTrigger
            value="leaderboard"
            onClick={() => handleTabClick('leaderboard')}
          >
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="reward" onClick={() => handleTabClick('reward')}>
            Reward
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-6 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Notification Feed */}
            <div className="lg:col-span-2 space-y-4">
              {isLoading ? (
                <div className="space-y-4 pb-20 md:pb-0">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-card-dark rounded-xl p-5 border border-gray-200 dark:border-gray-800 flex items-start gap-4 shadow-sm animate-pulse"
                    >
                      {/* Icon circle */}
                      <div className="shrink-0 w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Badge row + timestamp */}
                        <div className="flex justify-between items-start mb-2">
                          <div className="w-16 h-4 rounded-full bg-gray-200 dark:bg-gray-700" />
                          <div className="w-10 h-3 rounded bg-gray-200 dark:bg-gray-700" />
                        </div>
                        {/* Message lines */}
                        <div className="space-y-2 mb-3">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                        </div>
                        {/* Action buttons */}
                        <div className="flex gap-3">
                          <div className="h-8 w-20 rounded-lg bg-gray-200 dark:bg-gray-700" />
                          <div className="h-8 w-20 rounded-lg bg-gray-200 dark:bg-gray-700" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !isLoading && items.length > 0 ? (
                <>
                  <FadeInStagger
                    key={`${tab}-${refreshKey}`}
                    className="space-y-4"
                  >
                    {items.map((notification) => (
                      <FadeInItem key={notification.id}>
                        <NotificationCard notification={notification} />
                      </FadeInItem>
                    ))}
                  </FadeInStagger>

                  {hasNextPage && (
                    <div ref={ref} className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}
                </>
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
