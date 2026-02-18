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

/** User fields included in leaderboard entries */
export interface LeaderboardEntryUser {
  id: string;
  fullname: string | null;
  username: string | null;
  avatar: string | null;
  type: string | null;
}

/** A single entry in a leaderboard */
export interface LeaderboardEntryRecord {
  id: string;
  userId: string;
  leaderboardId: string;
  score: number;
  createdAt: string;
  updatedAt: string;
  lastScoreDate: string | null;
  isActive: boolean;
  user: LeaderboardEntryUser;
}

/** Full leaderboard detail returned by GET /api/leaderboards/[id] */
export type LeaderboardDetail = Leaderboard & {
  club: LeaderboardClubSummary | null;
  entries: LeaderboardEntryRecord[];
  _count: {
    entries: number;
  };
};

/** Normalized run data returned by both NRC and Strava services */
export interface RunData {
  id: string;
  date: string;
  distance: number;  // in km
  duration: number;  // in minutes
  pace: string;      // in min/km (e.g. "5:30")
  type: string;      // e.g. "run", "Run", "Trail Run"
  name: string;      // activity name
}

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
