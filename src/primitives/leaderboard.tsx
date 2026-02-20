import { Avatar, AvatarFallback, AvatarImage } from '@/primitives/avatar';
import { Badge } from '@/primitives/badge';
import { type UserLeaderboard } from '@prisma/client';
import React from 'react';

type LeaderboardEntry = Omit<
  UserLeaderboard,
  'createdAt' | 'updatedAt' | 'lastScoreDate'
> & {
  createdAt: Date | string;
  updatedAt: Date | string;
  lastScoreDate: Date | string | null;
  user: {
    id: string;
    fullname: string | null;
    username: string | null;
    avatar: string | null;
  };
};

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  currentUserId,
}) => {
  const sortedEntries = [...entries].sort((a, b) => b.score - a.score);

  return (
    <div className="grid grid-cols-1 w-full">
      <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 shadow-soft overflow-hidden">
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full text-left min-w-[700px] border-collapse">
            <thead className="bg-gray-50/80 dark:bg-white/5 border-b border-gray-100 dark:border-gray-800">
            <tr>
              <th className="w-24 px-8 py-4 uppercase text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400">
                Rank
              </th>
              <th className="px-8 py-4 uppercase text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400">
                Athlete
              </th>
              <th className="px-8 py-4 uppercase text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400 text-right">
                Score
              </th>
              <th className="px-8 py-4 uppercase text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400 text-right">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {sortedEntries.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry.userId === currentUserId;

              return (
                <tr
                  key={entry.id}
                  className={`group transition-colors border-0 hover:bg-gray-50/50 dark:hover:bg-white/5 ${
                    isCurrentUser ? 'bg-gray-50/80 dark:bg-white/10' : ''
                  }`}
                >
                  {/* Rank Pillar */}
                  <td className="px-8 py-5">
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shadow-sm ${
                        rank === 1
                          ? 'bg-gradient-to-br from-yellow-200 to-yellow-400 dark:from-yellow-900/40 dark:to-yellow-700/40 text-yellow-700 dark:text-yellow-400 ring-1 ring-yellow-400/20'
                          : rank === 2
                            ? 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 text-gray-600 dark:text-gray-300 ring-1 ring-gray-400/20'
                            : rank === 3
                              ? 'bg-gradient-to-br from-orange-200 to-orange-300 dark:from-orange-900/40 dark:to-orange-800/40 text-orange-700 dark:text-orange-400 ring-1 ring-orange-400/20'
                              : 'bg-transparent text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {rank}
                    </div>
                  </td>

                  {/* Athlete Identity */}
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4 min-w-[200px]">
                      <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-card-dark shadow-sm shrink-0">
                        {entry.user.avatar && (
                          <AvatarImage
                            src={entry.user.avatar}
                            alt={entry.user.fullname ?? 'User avatar'}
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback className="bg-gray-100 dark:bg-gray-800 font-bold text-sm text-gray-500 dark:text-gray-400">
                          {entry.user.fullname?.[0] ??
                            entry.user.username?.[0] ??
                            'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col truncate">
                        <span
                          className={`text-sm font-bold tracking-tight truncate ${
                            isCurrentUser
                              ? 'text-primary dark:text-white'
                              : 'text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          {entry.user.fullname ??
                            entry.user.username ??
                            'Unknown Athlete'}
                          {isCurrentUser && (
                            <span className="ml-2 text-[10px] uppercase font-black tracking-widest text-primary/60 dark:text-white/40">
                              (You)
                            </span>
                          )}
                        </span>
                        {entry.user.username && entry.user.fullname && (
                          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                            @{entry.user.username}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Metric/Score */}
                  <td className="px-8 py-5 text-right">
                    <Badge className="bg-primary/5 text-primary hover:bg-primary/10 dark:bg-primary/10 dark:text-white dark:hover:bg-primary/20 px-3 py-1.5 text-[13px] font-black tracking-tight tabular-nums border border-primary/10 dark:border-primary/20 rounded-xl shadow-sm whitespace-nowrap">
                      {entry.score.toLocaleString()}
                    </Badge>
                  </td>

                  {/* Timestamp */}
                  <td className="px-8 py-5 text-right whitespace-nowrap">
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors">
                      {entry.lastScoreDate
                        ? new Date(entry.lastScoreDate).toLocaleDateString(
                            undefined,
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )
                        : '—'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sortedEntries.length === 0 && (
        <div className="h-32 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800">
          No athletes have joined this leaderboard yet.
        </div>
      )}
      </div>
    </div>
  );
};
