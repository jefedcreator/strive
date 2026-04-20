import type { ClubQueryValidatorSchema } from '@/backend/validators/club.validator';
import type { ExploreQueryValidatorSchema } from '@/backend/validators/explore.validator';
import type {
  LeaderboardEntriesQueryValidatorSchema,
  LeaderboardQueryValidatorSchema,
} from '@/backend/validators/leaderboard.validator';
import type { NotificationQueryValidatorSchema } from '@/backend/validators/notification.validator';
import type { RewardsQueryValidatorSchema } from '@/backend/validators/rewards.validator';
import type {
  ApiResponse,
  ClubDetail,
  ClubInviteDetail,
  ClubListItem,
  ClubRewardDetail,
  ExploreListItem,
  LeaderboardDetail,
  LeaderboardInviteDetail,
  LeaderboardListItem,
  NotificationWithRelations,
  PaginatedApiResponse,
  RewardsData,
  RunData,
  UserRewardDetail,
} from '@/types';
import { type WithNull } from '@/utils';
import type { User } from '@prisma/client';
import { signOut, uncachedAuth } from './auth';

// Server-side fetches must use the internal Next.js port directly.
// NEXT_PUBLIC_APP_URL=http://localhost points to Nginx (a separate container) which is NOT reachable via localhost:80 from here.
const baseUrl = process.env.INTERNAL_API_URL || 'http://localhost:3000';

const fetcher = async (url: string): Promise<Response> => {
  let session = await uncachedAuth();

  if (!session?.user?.token) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    session = await uncachedAuth();
  }

  const res = await fetch(`${baseUrl}/api/${url}`, {
    headers: { Authorization: `Bearer ${session?.user.token}` },
    cache: 'no-store',
  });

  if (res.status === 401) {
    // Log warning but don't force logout from server side as it can cause loops
    console.warn(`Internal fetch 401: ${url}`);
    await signOut({ redirectTo: '/login' });
  }

  return res;
};

const toSearchParams = (params?: Record<string, any>): URLSearchParams => {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.set(key, String(value));
      }
    });
  }
  return searchParams;
};

async function getClubs(
  params?: WithNull<Partial<ClubQueryValidatorSchema>>
): Promise<PaginatedApiResponse<ClubListItem[]>> {
  try {
    const searchParams = toSearchParams(params);

    const url = `clubs${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    const res = await fetcher(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch clubs: ${res.statusText}`);
    }

    return res.json() as Promise<PaginatedApiResponse<ClubListItem[]>>;
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return {
      status: 500,
      message: 'Failed to fetch clubs',
      data: [],
      total: 0,
      page: 1,
      size: 1,
      totalPages: 0,
    };
  }
}

async function getClub(id: string): Promise<ApiResponse<ClubDetail | null>> {
  try {
    const url = `clubs/${id}`;
    const res = await fetcher(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch club: ${res.statusText}`);
    }

    return res.json() as Promise<ApiResponse<ClubDetail>>;
  } catch (error) {
    console.error('Error fetching club:', error);
    return {
      status: 500,
      message: 'Failed to fetch club',
      data: null,
    };
  }
}

async function getLeaderboards(
  params?: WithNull<Partial<LeaderboardQueryValidatorSchema>>
): Promise<PaginatedApiResponse<LeaderboardListItem[]>> {
  try {
    const searchParams = toSearchParams(params);
    const url = `leaderboards${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    const res = await fetcher(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch leaderboards: ${res.statusText}`);
    }

    return res.json() as Promise<PaginatedApiResponse<LeaderboardListItem[]>>;
  } catch (error) {
    console.error('Error fetching leaderboards:', error);
    return {
      status: 500,
      message: 'Failed to fetch leaderboards',
      data: [],
      total: 0,
      page: 1,
      size: 1,
      totalPages: 0,
    };
  }
}

async function getLeaderboard(
  id: string,
  params?: WithNull<Partial<LeaderboardEntriesQueryValidatorSchema>>
): Promise<ApiResponse<LeaderboardDetail | null>> {
  try {
    const searchParams = toSearchParams(params);

    const url = `leaderboards/${id}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const res = await fetcher(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch leaderboard: ${res.statusText}`);
    }

    return res.json() as Promise<ApiResponse<LeaderboardDetail>>;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return {
      status: 500,
      message: 'Failed to fetch leaderboard',
      data: null,
    };
  }
}

async function getNotifications(
  params?: WithNull<Partial<NotificationQueryValidatorSchema>>
): Promise<PaginatedApiResponse<NotificationWithRelations[]>> {
  try {
    const searchParams = toSearchParams(params);

    const url = `notifications${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    const res = await fetcher(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch notifications: ${res.statusText}`);
    }

    return res.json() as Promise<
      PaginatedApiResponse<NotificationWithRelations[]>
    >;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return {
      status: 500,
      message: 'Failed to fetch notifications',
      data: [],
      total: 0,
      page: 1,
      size: 1,
      totalPages: 0,
    };
  }
}

async function getProfile(): Promise<ApiResponse<User | null>> {
  try {
    const url = `users/me`;

    const res = await fetcher(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch profile: ${res.statusText}`);
    }

    return res.json() as Promise<ApiResponse<User>>;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return {
      status: 500,
      message: 'Failed to fetch profile',
      data: null,
    };
  }
}

async function getRuns(): Promise<ApiResponse<RunData[]>> {
  try {
    const url = `runs`;
    const res = await fetcher(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch runs: ${res.statusText}`);
    }

    return res.json() as Promise<ApiResponse<RunData[]>>;
  } catch (error) {
    console.error('Error fetching runs:', error);
    return {
      status: 500,
      message: 'Failed to fetch runs',
      data: [],
    };
  }
}

async function getClubInvite(
  id: string,
  invitesId: string
): Promise<ApiResponse<ClubInviteDetail | null>> {
  try {
    const url = `clubs/${id}/invites/${invitesId}`;
    const res = await fetcher(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch club invite: ${res.statusText}`);
    }

    return res.json() as Promise<ApiResponse<ClubInviteDetail>>;
  } catch (error) {
    console.error('Error fetching club invite:', error);
    return {
      status: 500,
      message: 'Failed to fetch club invite',
      data: null,
    };
  }
}

async function getLeaderboardInvite(
  id: string,
  invitesId: string
): Promise<ApiResponse<LeaderboardInviteDetail | null>> {
  try {
    const url = `leaderboards/${id}/invites/${invitesId}`;
    const res = await fetcher(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch leaderboard invite: ${res.statusText}`);
    }

    return res.json() as Promise<ApiResponse<LeaderboardInviteDetail>>;
  } catch (error) {
    console.error('Error fetching leaderboard invite:', error);
    return {
      status: 500,
      message: 'Failed to fetch leaderboard invite',
      data: null,
    };
  }
}

async function getExploreItems(
  params?: WithNull<Partial<ExploreQueryValidatorSchema>>
): Promise<PaginatedApiResponse<ExploreListItem[]>> {
  try {
    const searchParams = toSearchParams(params);

    const url = `explore${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    const res = await fetcher(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch explore items: ${res.statusText}`);
    }

    return res.json() as Promise<PaginatedApiResponse<ExploreListItem[]>>;
  } catch (error) {
    console.error('Error fetching explore items:', error);
    return {
      status: 500,
      message: 'Failed to fetch explore items',
      data: [],
      total: 0,
      page: 1,
      size: 1,
      totalPages: 0,
    };
  }
}

async function getRewards(
  params?: WithNull<Partial<RewardsQueryValidatorSchema>>
): Promise<PaginatedApiResponse<RewardsData>> {
  try {
    const searchParams = toSearchParams(params);

    const url = `rewards${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    const res = await fetcher(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch rewards: ${res.statusText}`);
    }

    return res.json() as Promise<PaginatedApiResponse<RewardsData>>;
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return {
      status: 500,
      message: 'Failed to fetch rewards',
      data: {
        data: [],
        xp: 0,
        currentStreak: 0,
        longestStreak: 0,
        tier: { name: 'Pacer', emoji: '🥉', threshold: 0 },
        nextTier: { name: 'Racer', emoji: '🥈', threshold: 1000 },
        tierBadgeUrl: '',
      },
      total: 0,
      page: 1,
      size: 1,
      totalPages: 0,
    };
  }
}

async function getReward(
  id: string
): Promise<ApiResponse<UserRewardDetail | null>> {
  try {
    const url = `rewards/${id}`;
    const res = await fetcher(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch reward: ${res.statusText}`);
    }

    return res.json() as Promise<ApiResponse<UserRewardDetail>>;
  } catch (error) {
    console.error('Error fetching reward:', error);
    return {
      status: 500,
      message: 'Failed to fetch reward',
      data: null,
    };
  }
}

async function getClubReward(
  id: string,
  rewardId: string
): Promise<ApiResponse<ClubRewardDetail | null>> {
  try {
    const url = `clubs/${id}/rewards/${rewardId}`;
    const res = await fetcher(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch club reward: ${res.statusText}`);
    }

    return res.json() as Promise<ApiResponse<ClubRewardDetail>>;
  } catch (error) {
    console.error('Error fetching club reward:', error);
    return {
      status: 500,
      message: 'Failed to fetch club reward',
      data: null,
    };
  }
}

export {
  getClub,
  getClubInvite,
  getClubReward,
  getClubs,
  getExploreItems,
  getLeaderboard,
  getLeaderboardInvite,
  getLeaderboards,
  getNotifications,
  getProfile,
  getReward,
  getRewards,
  getRuns,
};
