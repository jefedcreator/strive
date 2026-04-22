import {
  type Club,
  type Leaderboard,
  type Notification,
  type Reward,
  type User,
  type UserType,
} from '@prisma/client';
import type { SearchParams } from 'nuqs/server';
import type { Browser, Page } from 'puppeteer';

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

export interface ApiError {
  message: string;
}

export interface PaginatedApiResponse<T = unknown>
  extends ApiResponse<T>,
  PaginationMeta { }

/** Shape returned by GET /api/clubs — Club without memberCount, plus computed counts */
export type ClubListItem = Omit<Club, 'memberCount'> & {
  leaderboards: number;
  members: number;
  isMember: boolean;
};

/** A member record in a club */
export interface ClubMember {
  id: string;
  userId: string;
  user: User;
  clubId: string;
  role: string;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

/** Full club detail returned by GET /api/clubs/[id] */
export type ClubDetail = Club & {
  members: ClubMember[];
  leaderboards: Leaderboard[];
  rewards: Reward[];
  _count: {
    members: number;
    leaderboards: number;
    rewards: number;
  };
};

/** Partial club included in leaderboard responses */
export interface LeaderboardClubSummary {
  id: string;
  name: string;
  image: string | null;
  slug: string;
}

export type LeaderboardListItem = Leaderboard & {
  club: {
    name: string;
    id: string;
    image: string | null;
    slug: string;
  } | null;
  _count: {
    entries: number;
  };
  entries?: ({
    user: {
      id: string;
      avatar: string | null;
      fullname: string | null;
      username: string | null;
      type: true,
      xp: true,
      currentStreak: true,
    };
  } & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    userId: string;
    leaderboardId: string;
    score: number;
    lastScoreDate: Date | null;
    runId: string | null;
    runName: string | null;
    runDate: string | null;
    runDistance: number | null;
    runDuration: number | null;
    runPace: string | null;
  })[];
  isMember: boolean;
};

export type ExploreListItem =
  | (ClubListItem & { kind: 'club' })
  | (LeaderboardListItem & { kind: 'leaderboard' });

export type NotificationWithRelations = Notification & {
  user?: User | null;
  club?: Club | null;
  leaderboard?: Leaderboard | null;
};

/** User fields included in leaderboard entries */
export interface LeaderboardEntryUser {
  id: string;
  fullname: string | null;
  username: string | null;
  avatar: string | null;
  type: string | null;
  xp?: number;
  currentStreak?: number;
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
  // Best run data
  runId: string | null;
  runName: string | null;
  runDate: string | null;
  runDistance: number | null;
  runDuration: number | null;
  runPace: string | null;
  user: LeaderboardEntryUser;
}

/** Full leaderboard detail returned by GET /api/leaderboards/[id] */
export type LeaderboardDetail = Leaderboard & {
  // image: string | null;
  club: Pick<LeaderboardClubSummary, 'image'|"name"> | null;
  entries: LeaderboardEntryRecord[];
  _count: {
    entries: number;
  };
};

/** Normalized run data returned by both NRC and Strava services */
export interface RunData {
  id: string;
  date: string;
  distance: number; // in km
  duration: number; // in minutes
  pace: string; // in min/km (e.g. "5:30")
  name: string; // activity name
}

export interface ClubInviteDetail {
  id: string;
  clubId: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
  joinedAt: Date;
  isRequest: boolean;
  invitedBy: string | null;
  club: {
    id: string;
    name: string;
    image: string | null;
    description: string | null;
    memberCount: number;
  };
  inviter: {
    id: string;
    fullname: string | null;
    username: string | null;
    avatar: string | null;
  } | null;
}

export interface LeaderboardInviteDetail {
  id: string;
  leaderboardId: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
  joinedAt: Date;
  isRequest: boolean;
  invitedBy: string | null;
  leaderboard: {
    id: string;
    name: string;
    description: string | null;
    clubId: string | null;
    _count: {
      entries: number;
    };
  };
  inviter: {
    id: string;
    fullname: string | null;
    username: string | null;
    avatar: string | null;
  } | null;
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

interface PageProps {
  searchParams: Promise<SearchParams>;
}

type NRCLoginStep =
  | 'idle'
  | 'initializing' // POST /api/nrc/init in-flight
  | 'navigating' // waiting for 'ready' SSE event
  | 'email-modal' // Nike form is ready; show modal
  | 'processing' // credentials submitted
  | 'success'
  | 'error';

interface NikeAuthResult {
  type: UserType;
  email: string;
  token: string | null;
  fullname: string | null;
  avatar?: string | null;
}

interface PuppeteerNikeAuthResult {
  email: string | null;
  token: string | null;
  username: string | null;
  avatar: string | null;
}

interface CaptureOptions {
  headless?: boolean | 'new';
  userDataDir?: string;
  timeout?: number;
}

interface ActiveSession {
  browser: Browser;
  page: Page;
  startTime: number;
  resolve: (
    value: PuppeteerNikeAuthResult | PromiseLike<PuppeteerNikeAuthResult>
  ) => void;
  reject: (reason?: any) => void;
}

export interface RewardItem {
  id: string;
  rewardId: string;
  type: 'GOLD' | 'SILVER' | 'BRONZE' | 'CLUB_MILESTONE';
  title: string;
  description: string | null;
  earnedAt: Date;
  leaderboard: { id: string; name: string; clubId: string | null } | null;
  club: { id: string; name: string; slug: string } | null;
  milestone: number | null;
  badgeUrl: string;
}

export interface ClubRewardItem {
  id: string;
  type: 'GOLD' | 'SILVER' | 'BRONZE' | 'CLUB_MILESTONE';
  title: string;
  description: string | null;
  milestone: number | null;
  createdAt: Date;
  earnedBy: number;
  badgeUrl: string;
}

export interface UserRewardDetail {
  id: string;
  userId: string;
  earnedAt: Date;
  user: {
    fullname: string | null;
    username: string | null;
    avatar: string | null;
  };
  reward: {
    type: 'GOLD' | 'SILVER' | 'BRONZE' | 'CLUB_MILESTONE';
    title: string;
    description: string | null;
    milestone: number | null;
    leaderboard: { name: string } | null;
    club: { name: string } | null;
  };
}

export interface ClubRewardDetail {
  id: string;
  type: 'GOLD' | 'SILVER' | 'BRONZE' | 'CLUB_MILESTONE';
  title: string;
  description: string | null;
  milestone: number | null;
  createdAt: Date;
  club: {
    id: string;
    name: string;
    image: string | null;
    isPublic: boolean;
  };
}

export interface RewardsData {
  data: RewardItem[];
  xp: number;
  currentStreak: number;
  longestStreak: number;
  tier: { name: string; emoji: string; threshold: number };
  nextTier: { name: string; emoji: string; threshold: number } | null;
  tierBadgeUrl: string;
}


//  interface NikeAuthResult {
//   email: string | null;
//   token: string | null;
//   username: string | null;
// }

// const wsUrl = `wss://brd-customer-hl_d063dc7f-zone-strive_browser1:i9gep3lg6frd@brd.superproxy.io:9222`;

interface CaptureOptions {
  headless?: boolean | 'new';
  userDataDir?: string;
  timeout?: number;
  email?: string;
  password?: string;
}


interface SearchedUser extends Pick<User, 'id' | 'fullname' | 'avatar' | 'username'> {
  isExternal?: boolean
}

export { DateRangeFilters };
export type {
  ActiveSession, Activity, CaptureOptions, FilterOption,
  ISubMenu, LeaderboardEntry, NikeAuthResult, NRCLoginStep,
  Option,
  PageProps,
  PuppeteerNikeAuthResult, SearchedUser
};

