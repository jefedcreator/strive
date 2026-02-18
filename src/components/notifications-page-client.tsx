'use client';

import { type FilterOption, type NotificationWithRelations, type PaginatedApiResponse } from '@/types';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import FilterPanel from './filterpanel';
import { NotificationCard } from './notification-card';

interface NotificationsPageClientProps {
  initialData: PaginatedApiResponse<NotificationWithRelations[]>;
}

const NotificationsPageClient: React.FC<NotificationsPageClientProps> = ({ initialData }) => {
  const { data: session } = useSession();
  const [filters, setFilters] = useState<FilterOption[]>([
    { id: 'all', label: 'All Notifications', checked: true },
    { id: 'info', label: 'General Info', checked: false },
    { id: 'club', label: 'Club Activity', checked: false },
    { id: 'leaderboard', label: 'Leaderboard Activity', checked: false },
  ]);

  const { data: notificationsResponse } = useQuery<PaginatedApiResponse<NotificationWithRelations[]>>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await axios.get<PaginatedApiResponse<NotificationWithRelations[]>>('/api/notifications', {
        headers: { Authorization: `Bearer ${session?.user.token}` },
      });
      return data;
    },
    initialData,
    staleTime: Infinity,
  });

  const notifications = notificationsResponse.data;

  const handleFilterChange = (id: string) => {
    if (id === 'all') {
      setFilters(prev => prev.map(f => ({
        ...f,
        checked: f.id === 'all',
      })));
    } else {
      setFilters(prev => {
        const newFilters = prev.map(f => {
          if (f.id === id) return { ...f, checked: !f.checked };
          if (f.id === 'all') return { ...f, checked: false };
          return f;
        });

        const anyChecked = newFilters.some(f => f.id !== 'all' && f.checked);
        if (!anyChecked) {
          return newFilters.map(f => f.id === 'all' ? { ...f, checked: true } : f);
        }
        return newFilters;
      });
    }
  };

  // Filtering logic based on NotificationType enum values
  const activeFilterIds = filters.filter(f => f.checked && f.id !== 'all').map(f => f.id);
  const isAllFilter = filters.find(f => f.id === 'all')?.checked;

  const filteredNotifications = useMemo(() => {
    if (isAllFilter) return notifications;
    return notifications.filter(n => activeFilterIds.includes(n.type));
  }, [notifications, isAllFilter, activeFilterIds]);

  // Split notifications into today vs. earlier
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayNotifications = useMemo(
    () => filteredNotifications.filter(n => new Date(n.createdAt) >= today),
    [filteredNotifications, today]
  );

  const olderNotifications = useMemo(
    () => filteredNotifications.filter(n => new Date(n.createdAt) < today),
    [filteredNotifications, today]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Notifications</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Stay updated with your latest activities, club invites, and records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Notification Feed */}
        <div className="lg:col-span-2 space-y-4">

          {/* Today Section */}
          {todayNotifications.length > 0 && (
            <>
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today</h3>
                <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors">
                  Mark all as read
                </button>
              </div>
              <div className="space-y-4">
                {todayNotifications.map(notification => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))}
              </div>
            </>
          )}

          {/* Earlier Section */}
          {olderNotifications.length > 0 && (
            <>
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800 mt-8 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Earlier</h3>
              </div>
              <div className="space-y-4">
                {olderNotifications.map(notification => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))}
              </div>
            </>
          )}

          {todayNotifications.length === 0 && olderNotifications.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-800">
              <span className="material-symbols-outlined text-4xl mb-2 text-gray-300 dark:text-gray-600">
                notifications_none
              </span>
              <p className="text-gray-500 dark:text-gray-400">No notifications found for the selected filters.</p>
            </div>
          )}
        </div>

        {/* Right Sidebar / Filter Panel */}
        <div className="hidden lg:block">
          <div className="sticky top-4">
            <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
          </div>
        </div>

        {/* Mobile Filter */}
        <div className="block lg:hidden mt-8">
          <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
        </div>
      </div>
    </div>
  );
};

export default NotificationsPageClient;