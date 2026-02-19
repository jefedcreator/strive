import React from 'react';
import { type NotificationWithRelations } from '@/types';
import { type NotificationType } from '@prisma/client';

interface NotificationCardProps {
  notification: NotificationWithRelations;
}

const typeConfig: Record<
  NotificationType,
  { icon: string; iconBg: string; iconText: string; label: string }
> = {
  info: {
    icon: 'info',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconText: 'text-blue-600 dark:text-blue-400',
    label: 'Info',
  },
  club: {
    icon: 'groups',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconText: 'text-green-600 dark:text-green-400',
    label: 'Club',
  },
  leaderboard: {
    icon: 'emoji_events',
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

  return (
    <div
      className={`bg-white dark:bg-card-dark rounded-xl p-5 border border-gray-200 dark:border-gray-800 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow ${
        notification.isRead ? 'opacity-70 hover:opacity-100' : ''
      }`}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        <div
          className={`h-12 w-12 rounded-full ${config.iconBg} flex items-center justify-center ${config.iconText}`}
        >
          <span className="material-symbols-outlined text-xl">
            {config.icon}
          </span>
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
                <span className="material-symbols-outlined text-xs">
                  groups
                </span>
                {notification.club.name}
              </p>
            )}
            {notification.leaderboard && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">
                  emoji_events
                </span>
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
              <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors shadow-sm">
                View Club
              </button>
              <button className="bg-white dark:bg-transparent border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-2 rounded-lg text-xs font-medium transition-colors">
                Dismiss
              </button>
            </div>
          )}

        {/* Actions for leaderboard notifications */}
        {notification.type === 'leaderboard' && notification.leaderboard && (
          <div className="mt-3">
            <a
              href={`/leaderboards/${notification.leaderboard.id}`}
              className="text-xs text-gray-900 dark:text-white font-medium hover:underline flex items-center group"
            >
              View Leaderboard
              <span className="material-symbols-outlined text-sm ml-1 group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
