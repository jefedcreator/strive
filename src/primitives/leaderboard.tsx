import { Avatar, AvatarFallback, AvatarImage } from '@/primitives/avatar';
import { Badge } from '@/primitives/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/primitives/table';
import { type UserLeaderboard, type LeaderboardType } from '@prisma/client';
import { getTier } from '@/backend/services/xp/logic';
import { ProfileFrame } from '@/components/profile-frame';
import React from 'react';
import { parsePace, formatDuration } from '@/utils';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

type LeaderboardEntry = Omit<
  UserLeaderboard,
  'createdAt' | 'updatedAt' | 'lastScoreDate' | 'formerPosition' | 'currentPosition'
> & {
  formerPosition?: number | null;
  currentPosition?: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  lastScoreDate: Date | string | null;
  user: {
    id: string;
    fullname: string | null;
    username: string | null;
    avatar: string | null;
    xp?: number;
    currentStreak?: number;
    type?: string | null;
  };
};

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  leaderboardType?: LeaderboardType;
  disableInternalSort?: boolean;
  movementTooltipMode?: 'historical' | 'relative';
}

type SortField = 'default' | 'runDistance' | 'runPace';

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  currentUserId,
  leaderboardType = 'DISTANCE',
  disableInternalSort = false,
  movementTooltipMode = 'historical',
}) => {
  const [sortField, setSortField] = React.useState<SortField>('default');

  const handleSort = (field: 'runDistance' | 'runPace') => {
    setSortField((prev) => (prev === field ? 'default' : field));
  };

  const sortedEntries = React.useMemo(() => {
    if (disableInternalSort) return entries;
    const sorted = [...entries];
    if (sortField === 'runDistance') {
      return sorted.sort((a, b) => (b.runDistance ?? 0) - (a.runDistance ?? 0));
    }
    if (sortField === 'runPace') {
      return sorted.sort((a, b) => parsePace(a.runPace) - parsePace(b.runPace));
    }
    // Default sort based on leaderboard type
    if (leaderboardType === 'PACE') {
      return sorted.sort((a, b) => parsePace(a.runPace) - parsePace(b.runPace));
    }
    // COMBINED and DISTANCE both default to score (distance) desc
    return sorted.sort((a, b) => b.score - a.score);
  }, [entries, sortField, leaderboardType, disableInternalSort]);

  const activeSortField = disableInternalSort
    ? 'default'
    : sortField !== 'default'
      ? sortField
      : leaderboardType === 'PACE'
        ? 'runPace'
        : 'runDistance';

  const getMovementTooltip = (rankDiff: number) => {
    const directionLabel =
      rankDiff > 0
        ? `Up ${rankDiff}`
        : rankDiff < 0
          ? `Down ${Math.abs(rankDiff)}`
          : 'No change';

    const contextLabel =
      movementTooltipMode === 'historical'
        ? 'since the last leaderboard update'
        : 'relative to the default leaderboard order';

    return `${directionLabel} ${contextLabel}`;
  };

  return (
    <div className="grid grid-cols-1 w-full">
      <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 shadow-soft overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table className="w-full text-left min-w-[700px] border-collapse">
            <TableHeader className="bg-gray-50/80 dark:bg-white/5 border-b border-gray-100 dark:border-gray-800">
              <TableRow>
                <TableHead className="w-24 px-8 py-4 uppercase text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400">
                  Rank
                </TableHead>
                <TableHead className="px-8 py-4 uppercase text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400">
                  Athlete
                </TableHead>
                <TableHead className="px-8 py-4 uppercase text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400 text-right">
                  Distance
                </TableHead>
                <TableHead className="px-8 py-4 uppercase text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400 text-right">
                  Avg Pace
                </TableHead>
                <TableHead className="px-8 py-4 uppercase text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400 text-right">
                  Total Time
                </TableHead>
                <TableHead className="px-8 py-4 uppercase text-[10px] font-bold tracking-widest text-gray-500 dark:text-gray-400 text-right">
                  Last Run
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {sortedEntries.map((entry, index) => {
                const rank =
                  disableInternalSort && entry.currentPosition != null
                    ? entry.currentPosition
                    : index + 1;
                const currentPosition = entry.currentPosition ?? rank;
                const formerPosition = entry.formerPosition ?? currentPosition;
                const rankDiff = formerPosition - currentPosition;
                const isCurrentUser = entry.userId === currentUserId;

                return (
                  <TableRow
                    key={entry.id}
                    className={`group transition-colors border-0 hover:bg-gray-50/50 dark:hover:bg-white/5 ${
                      isCurrentUser ? 'bg-gray-50/80 dark:bg-white/10' : ''
                    }`}
                  >
                    {/* Rank */}
                    <TableCell className="px-8 py-5">
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
                    </TableCell>

                    {/* Athlete */}
                    <TableCell className="px-8 py-5">
                      <div className="flex items-center gap-4 min-w-[200px]">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="flex flex-col truncate">
                            <span
                              className={`text-sm font-bold tracking-tight truncate flex items-center gap-1.5 ${
                                isCurrentUser
                                  ? 'text-primary dark:text-white'
                                  : 'text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              <span className="shrink-0 inline-flex items-center justify-center w-5">
                                {rankDiff > 0 ? (
                                  <span
                                    className="flex items-center gap-0.5"
                                    title={getMovementTooltip(rankDiff)}
                                  >
                                    <ArrowUp
                                      className="w-3.5 h-3.5 text-emerald-500"
                                      strokeWidth={3}
                                    />
                                    <span className="text-[10px] font-bold text-emerald-500 tabular-nums">
                                      +{rankDiff}
                                    </span>
                                  </span>
                                ) : rankDiff < 0 ? (
                                  <span
                                    className="flex items-center gap-0.5"
                                    title={getMovementTooltip(rankDiff)}
                                  >
                                    <ArrowDown
                                      className="w-3.5 h-3.5 text-red-500"
                                      strokeWidth={3}
                                    />
                                    <span className="text-[10px] font-bold text-red-500 tabular-nums">
                                      -{Math.abs(rankDiff)}
                                    </span>
                                  </span>
                                ) : (
                                  <span title={getMovementTooltip(rankDiff)}>
                                    <Minus
                                      className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600"
                                      strokeWidth={3}
                                    />
                                  </span>
                                )}
                              </span>
                              {entry.user.fullname ??
                                entry.user.username ??
                                'Guest'}
                              {isCurrentUser && (
                                <span className="text-[10px] uppercase font-black tracking-widest text-primary/60 dark:text-white/40">
                                  (You)
                                </span>
                              )}
                              {/* Tier badge */}
                              {entry.user.xp != null && (
                                <span
                                  className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/5"
                                  title={`${getTier(entry.user.xp).name} — ${entry.user.xp.toLocaleString()} XP`}
                                >
                                  {getTier(entry.user.xp).emoji}
                                  <span className="text-gray-500 dark:text-gray-400">
                                    {getTier(entry.user.xp).name}
                                  </span>
                                </span>
                              )}
                              {/* Platform badge */}
                              {entry.user.type && (
                                <span className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter">
                                  {entry.user.type}
                                </span>
                              )}
                            </span>
                            {entry.user.username && entry.user.fullname && (
                              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                                @{entry.user.username}
                              </span>
                            )}
                          </div>
                          <ProfileFrame
                            xp={entry.user.xp}
                            streak={entry.user.currentStreak}
                            size="md"
                          >
                            <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-card-dark shadow-sm shrink-0">
                              {entry.user.avatar && (
                                <AvatarImage
                                  src={entry.user.avatar}
                                  alt={
                                    entry.user.fullname ??
                                    entry.user.username ??
                                    'Guest'
                                  }
                                  className="object-cover"
                                />
                              )}
                              <AvatarFallback className="bg-gray-100 dark:bg-gray-800 font-bold text-sm text-gray-500 dark:text-gray-400">
                                {entry.user.fullname?.[0] ??
                                  entry.user.username?.[0] ??
                                  'G'}
                              </AvatarFallback>
                            </Avatar>
                          </ProfileFrame>
                        
                        </div>
                      </div>
                    </TableCell>

                    {/* Distance */}
                    <TableCell className="px-8 py-5 text-right">
                      <Badge className="bg-primary/5 text-primary hover:bg-primary/10 dark:bg-primary/10 dark:text-white dark:hover:bg-primary/20 px-3 py-1.5 text-[13px] font-black tracking-tight tabular-nums border border-primary/10 dark:border-primary/20 rounded-xl shadow-sm whitespace-nowrap">
                        {entry.runDistance != null
                          ? `${entry.runDistance.toFixed(2)} km`
                          : '—'}
                      </Badge>
                    </TableCell>

                    {/* Avg Pace */}
                    <TableCell className="px-8 py-5 text-right whitespace-nowrap">
                      <span className="text-sm font-semibold tabular-nums text-gray-700 dark:text-gray-300">
                        {entry.runPace ?? '—'}
                        {entry.runPace && (
                          <span className="ml-1 text-[10px] font-normal text-gray-400 dark:text-gray-500">
                            /km
                          </span>
                        )}
                      </span>
                    </TableCell>

                    {/* Total Time */}
                    <TableCell className="px-8 py-5 text-right whitespace-nowrap">
                      <span className="text-sm font-semibold tabular-nums text-gray-700 dark:text-gray-300">
                        {formatDuration(entry.runDuration)}
                      </span>
                    </TableCell>

                    {/* Last Run date */}
                    <TableCell className="px-8 py-5 text-right whitespace-nowrap">
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
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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
