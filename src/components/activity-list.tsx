'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/primitives/avatar';
import { Badge } from '@/primitives/badge';
import { type LeaderboardEntryRecord } from '@/types';
import { cn } from '@/utils';
import { type User } from '@prisma/client';
import Link from 'next/link';
import { FadeInItem, FadeInStagger } from './fade-in';

export interface Activity {
  id: string;
  user: Partial<User>;
  leaderboardTitle?: string;
  clubName?: string;
  action: string;
  time: string;
}

interface ActivityListProps {
  title?: string;
  activities?: Activity[];
  entries?: LeaderboardEntryRecord[];
  viewAllLink?: string;
  className?: string;
  type?: 'activity' | 'ranking';
}

export function ActivityList({
  title = 'Recent Activity',
  activities,
  entries,
  viewAllLink = '#',
  className,
  type = 'activity',
}: ActivityListProps) {
  const isRanking = type === 'ranking' || !!entries;

  const renderActivityItem = (activity: Activity) => (
    <div
      key={activity.id}
      className="group flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200 border-b border-border-light/50 dark:border-border-dark/50 last:border-0 last:pb-0"
    >
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800 shadow-sm transition-transform group-hover:scale-105">
          {activity.user.avatar && (
            <AvatarImage
              src={activity.user.avatar}
              alt={activity.user.fullname ?? 'User'}
              className="object-cover"
            />
          )}
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
            {activity.user.fullname?.[0] ?? 'U'}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {activity.user.fullname}
          </p>
          <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
            {activity.time}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Badge
            variant="outline"
            className="text-[10px] uppercase tracking-wider px-1.5 py-0 rounded-md border-primary/20 bg-primary/5 text-primary"
          >
            {activity.action}
          </Badge>
          {activity.leaderboardTitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              in <span className="text-gray-700 dark:text-gray-200 font-medium">{activity.leaderboardTitle}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderRankingItem = (entry: LeaderboardEntryRecord, index: number) => {
    const rank = index + 1;
    const isTopThree = rank <= 3;

    return (
      <div
        key={entry.id}
        className={cn(
          "group flex items-center space-x-4 p-3 rounded-xl transition-all duration-200 border-b border-border-light/50 dark:border-border-dark/50 last:border-0",
          isTopThree ? "bg-white dark:bg-white/5 shadow-sm" : "hover:bg-gray-50 dark:hover:bg-white/5"
        )}
      >
        <div className="flex-shrink-0 w-8 flex justify-center">
          <span className={cn(
            "font-bold text-sm",
            rank === 1 ? "text-yellow-500 text-lg" : 
            rank === 2 ? "text-gray-400 text-base" : 
            rank === 3 ? "text-amber-600 text-base" : "text-gray-400"
          )}>
            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
          </span>
        </div>

        <div className="relative flex-shrink-0">
          <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800 shadow-sm transition-transform group-hover:scale-105">
            {entry.user.avatar && (
              <AvatarImage
                src={entry.user.avatar}
                alt={entry.user.fullname ?? 'User'}
                className="object-cover"
              />
            )}
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              {entry.user.fullname?.[0] ?? 'U'}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {entry.user.fullname}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            @{entry.user.username}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
            {entry.score.toLocaleString()}
          </p>
          {entry.lastScoreDate ? (
            <p className="text-[10px] text-gray-400 font-medium">
              last: {new Date(entry.lastScoreDate).toLocaleDateString()}
            </p>
          ) : (
            <p className="text-[10px] text-gray-400 font-medium">pts</p>
          )}
        </div>
      </div>
    );
  };

  const data = isRanking ? entries : activities;
  const hasData = data && data.length > 0;

  return (
    <div className={cn(
      "bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark shadow-soft overflow-hidden flex flex-col",
      className
    )}>
      <div className="px-6 py-5 border-b border-border-light dark:border-border-dark flex justify-between items-center shrink-0">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          {title}
          {hasData && (
            <span className="text-[10px] bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full font-bold">
              {data.length}
            </span>
          )}
        </h3>
        {viewAllLink && (
          <Link
            className="text-xs font-semibold text-primary hover:text-primary/80 dark:text-white dark:hover:text-gray-300 transition-colors"
            href={viewAllLink}
          >
            View All
          </Link>
        )}
      </div>

      <div className="p-2 overflow-y-auto max-h-[500px] scrollbar-hide">
        {!hasData ? (
          <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
            <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
          </div>
        ) : (
          <FadeInStagger className="space-y-1">
            {isRanking
              ? entries!.map((entry, idx) => (
                  <FadeInItem key={entry.id}>
                    {renderRankingItem(entry, idx)}
                  </FadeInItem>
                ))
              : activities!.map((activity) => (
                  <FadeInItem key={activity.id}>
                    {renderActivityItem(activity)}
                  </FadeInItem>
                ))}
          </FadeInStagger>
        )}
      </div>
    </div>
  );
}
