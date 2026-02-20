import React from 'react';
import { type ApiError, type NotificationWithRelations } from '@/types';
import { type NotificationType } from '@prisma/client';
import { Info, Users, Trophy, ArrowRight, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

interface NotificationCardProps {
  notification: NotificationWithRelations;
}

const typeConfig: Record<
  NotificationType,
  { icon: React.ElementType; iconBg: string; iconText: string; label: string }
> = {
  info: {
    icon: Info,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconText: 'text-blue-600 dark:text-blue-400',
    label: 'Info',
  },
  club: {
    icon: Users,
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconText: 'text-green-600 dark:text-green-400',
    label: 'Club',
  },
  leaderboard: {
    icon: Trophy,
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconText: 'text-orange-600 dark:text-orange-400',
    label: 'Leaderboard',
  },
};

function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
}) => {
  const config = typeConfig[notification.type];
  const queryClient = useQueryClient();
  console.log('notification', notification.type);

  const acceptClubMutation = useMutation({
    mutationFn: async (clubId: string) => {
      await axios.post(`/api/clubs/${clubId}/accept`, {
        userId: notification.userId,
      });
    },
    onSuccess: () => {
      toast.success('Accepted club invite');
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['clubs'] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(
        error.response?.data?.message ?? 'Failed to accept club invite'
      );
    },
  });

  const acceptLeaderboardMutation = useMutation({
    mutationFn: async (leaderboardId: string) => {
      await axios.post(`/api/leaderboards/${leaderboardId}/accept`, {
        userId: notification.userId,
      });
    },
    onSuccess: () => {
      toast.success('Accepted leaderboard invite');
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['leaderboards'] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(
        error.response?.data?.message ?? 'Failed to accept leaderboard invite'
      );
    },
  });

  const dismissMutation = useMutation({
    mutationFn: async () => {
      await axios.patch(`/api/notifications/${notification.id}`, {
        isRead: true,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      toast.error('Failed to dismiss notification');
    },
  });

  const isPending =
    acceptClubMutation.isPending ||
    acceptLeaderboardMutation.isPending ||
    dismissMutation.isPending;

  return (
    <div
      className={`bg-white dark:bg-card-dark rounded-xl p-5 border border-gray-200 dark:border-gray-800 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow ${
        notification.isRead ? 'opacity-70 hover:opacity-100' : ''
      }`}
    >
      <div className="flex-shrink-0">
        <div
          className={`h-12 w-12 rounded-full ${config.iconBg} flex items-center justify-center ${config.iconText}`}
        >
          <config.icon className="w-6 h-6" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div className="pr-2">
            {/* Type badge + unread indicator */}
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${config.iconBg} ${config.iconText}`}
              >
                {config.label}
              </span>
              {!notification.isRead && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>

            {/* Message */}
            <p className="text-gray-900 dark:text-white font-medium text-sm break-words">
              {notification.message}
            </p>

            {/* Related entity */}
            {notification.club && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {notification.club.name}
              </p>
            )}
            {notification.leaderboard && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                {notification.leaderboard.name}
              </p>
            )}
          </div>

          {/* Timestamp */}
          <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap flex-shrink-0">
            {formatTimeAgo(notification.createdAt)}
          </span>
        </div>

        {/* Actions for club notifications */}
        {notification.type === 'club' &&
          notification.club &&
          !notification.isRead && (
            <div className="mt-3 flex gap-3">
              <button
                onClick={() => acceptClubMutation.mutate(notification.club!.id)}
                disabled={isPending}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors shadow-sm flex items-center justify-center min-w-[80px] disabled:opacity-50"
              >
                {acceptClubMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  'Accept'
                )}
              </button>
              <button
                onClick={() => dismissMutation.mutate()}
                disabled={isPending}
                className="bg-white dark:bg-transparent border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 flex items-center justify-center min-w-[80px]"
              >
                {dismissMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  'Decline'
                )}
              </button>
            </div>
          )}

        {/* Actions for leaderboard notifications */}
        {notification.type === 'leaderboard' &&
          notification.leaderboard &&
          !notification.isRead && (
            <div className="mt-3 flex gap-3">
              <button
                onClick={() =>
                  acceptLeaderboardMutation.mutate(notification.leaderboard!.id)
                }
                disabled={isPending}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors shadow-sm flex items-center justify-center min-w-[80px] disabled:opacity-50"
              >
                {acceptLeaderboardMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  'Accept'
                )}
              </button>
              <button
                onClick={() => dismissMutation.mutate()}
                disabled={isPending}
                className="bg-white dark:bg-transparent border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 flex items-center justify-center min-w-[80px]"
              >
                {dismissMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  'Decline'
                )}
              </button>
            </div>
          )}

        {/* Fallback View Link for Read or other types */}
        {notification.isRead &&
          notification.type === 'leaderboard' &&
          notification.leaderboard && (
            <div className="mt-3">
              <a
                href={`/leaderboards/${notification.leaderboard.id}`}
                className="text-xs text-gray-900 dark:text-white font-medium hover:underline flex items-center group"
              >
                View Leaderboard
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          )}
        {notification.isRead &&
          notification.type === 'club' &&
          notification.club && (
            <div className="mt-3">
              <a
                href={`/clubs/${notification.club.id}`}
                className="text-xs text-gray-900 dark:text-white font-medium hover:underline flex items-center group"
              >
                View Club
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          )}
      </div>
    </div>
  );
};
