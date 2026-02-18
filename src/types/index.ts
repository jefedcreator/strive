import { type Club, type Leaderboard, type Notification, type User } from '@prisma/client';

export interface PaginationMeta {
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  status: number;
  message: string;
  data: T;
}

export interface PaginatedApiResponse<T = unknown>
  extends ApiResponse<T>,
  PaginationMeta { }

/** Shape returned by GET /api/clubs — Club without memberCount, plus computed counts */
export type ClubListItem = Omit<Club, 'memberCount'> & {
  leaderboards: number;
  members: number;
};

/** Partial club included in leaderboard responses */
export interface LeaderboardClubSummary {
  id: string;
  name: string;
  image: string | null;
  slug: string;
}

/** Shape returned by GET /api/leaderboards — Leaderboard with partial club and entry count */
export type LeaderboardListItem = Leaderboard & {
  club: LeaderboardClubSummary | null;
  _count: {
    entries: number;
  };
};

/** Composite type for Notification with User and optional Club relations */
export type NotificationWithRelations = Notification & {
  user?: User;
  club?: Club;
  leaderboard?: Leaderboard;
};

interface ISubMenu {
  name: string;
  isActive: boolean;
  subMenu: {
    name: string;
    function: () => void;
    isActive: boolean;
  }[];
}

type Option = {
  value: string;
  label: string;
  icon?:
  | {
    1: string;
    2?: string | undefined;
  }
  | undefined;
};

enum DateRangeFilters {
  thisWeek = 'this-week',
  lastWeek = 'last-week',
  thisMonth = 'this-month',
  lastMonth = 'last-month',
  thisYear = 'this-year',
}

interface LeaderboardEntry {
  rank: number;
  athlete: string;
  distance: string;
  avgPace: string;
  initials: string;
  color: string;
}

interface Activity {
  id: string;
  club: string;
  description: string;
  time: string;
  initials: string;
  color: string;
}

interface FilterOption {
  id: string;
  label: string;
  checked: boolean;
}

export type { ISubMenu, Option, LeaderboardEntry, Activity, FilterOption };
export { DateRangeFilters };
