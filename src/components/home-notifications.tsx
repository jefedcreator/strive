'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/utils/axios';
import { type AxiosError } from 'axios';
import { type PaginatedApiResponse, type ApiResponse } from '@/types'; // Added ApiResponse
import type { NotificationWithRelations } from '@/types';
import { typeConfig } from '@/components/top-nav';
import { Bell } from 'lucide-react';
import Link from 'next/link';

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo`;

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y`;
}

export function HomeNotifications({ token }: { token: string }) {
  const { data, isLoading } = useQuery<
    PaginatedApiResponse<NotificationWithRelations[]> // Kept PaginatedApiResponse for consistency with data type
  >({
    queryKey: ['notifications', 'home-preview'],
    queryFn: async () => {
      const res = await api.get<
        PaginatedApiResponse<NotificationWithRelations[]>
      >('/notifications', {
        params: { page: 1, limit: 10 },
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const notifications = data?.data ?? [];

  return (
    <div className="bg-card-light dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Notifications
        </h2>
        <Link
          href="/notifications"
          className="text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          // Skeleton loaders
          Array.from({ length: 3 }).map((_, i) => (
            <div key={`skel-${i}`} className="flex gap-4 animate-pulse">
              <div className="w-10 h-10 shrink-0 rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="space-y-2 flex-1 pt-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-gray-400 dark:text-gray-500">
            <Bell className="w-8 h-8 mb-3 opacity-20" />
            <p className="text-sm font-medium">No recent notifications</p>
          </div>
        ) : (
          notifications.map((n) => {
            const cfg = typeConfig[n.type] ?? typeConfig.info;
            const Icon = cfg.icon;
            return (
              <Link
                href="/notifications"
                key={n.id}
                className={`flex gap-4 group cursor-pointer ${n.isRead ? 'opacity-70' : ''}`}
              >
                <div
                  className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${cfg.iconBg} ${cfg.iconText}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {n.message}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
                    {timeAgo(n.createdAt)}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
