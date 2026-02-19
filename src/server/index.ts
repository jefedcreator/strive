import type { ClubQueryValidatorSchema } from '@/backend/validators/club.validator';
import type { LeaderboardQueryValidatorSchema } from '@/backend/validators/leaderboard.validator';
import type { NotificationQueryValidatorSchema } from '@/backend/validators/notification.validator';
import type {
  ApiResponse,
  ClubDetail,
  ClubListItem,
  InviteDetail,
  LeaderboardDetail,
  LeaderboardListItem,
  NotificationWithRelations,
  PaginatedApiResponse,
  RunData,
} from '@/types';
import { uncachedAuth } from './auth';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

const fetcher = async (url: string): Promise<Response> => {
  const session = await uncachedAuth();
  return await fetch(url, {
    headers: { Authorization: `Bearer ${session?.user.token}` },
    cache: 'no-store',
  });
};

async function getClubs(
  params?: Partial<ClubQueryValidatorSchema>
): Promise<PaginatedApiResponse<ClubListItem[]>> {
  try {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, String(value));
        }
      });
    }

    const url = `${baseUrl}/api/clubs${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

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
    const url = `${baseUrl}/api/clubs/${id}`;
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
  params?: Partial<LeaderboardQueryValidatorSchema>
): Promise<PaginatedApiResponse<LeaderboardListItem[]>> {
  try {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, String(value));
        }
      });
    }

    const url = `${baseUrl}/api/leaderboards${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

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
  id: string
): Promise<ApiResponse<LeaderboardDetail | null>> {
  try {
    const url = `${baseUrl}/api/leaderboards/${id}`;
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
  params?: Partial<NotificationQueryValidatorSchema>
): Promise<PaginatedApiResponse<NotificationWithRelations[]>> {
  try {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, String(value));
        }
      });
    }

    const url = `${baseUrl}/api/notifications${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

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

async function getRuns(): Promise<ApiResponse<RunData[]>> {
  try {
    const url = `${baseUrl}/api/runs`;
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
): Promise<ApiResponse<InviteDetail | null>> {
  try {
    const url = `${baseUrl}/api/clubs/${id}/invites/${invitesId}`;
    const res = await fetcher(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch club invite: ${res.statusText}`);
    }

    return res.json() as Promise<ApiResponse<InviteDetail>>;
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
): Promise<ApiResponse<InviteDetail | null>> {
  try {
    const url = `${baseUrl}/api/leaderboards/${id}/invites/${invitesId}`;
    const res = await fetcher(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch leaderboard invite: ${res.statusText}`);
    }

    return res.json() as Promise<ApiResponse<InviteDetail>>;
  } catch (error) {
    console.error('Error fetching leaderboard invite:', error);
    return {
      status: 500,
      message: 'Failed to fetch leaderboard invite',
      data: null,
    };
  }
}

export {
  getClubInvite,
  getClubs,
  getClub,
  getLeaderboards,
  getLeaderboard,
  getNotifications,
  getRuns,
  getLeaderboardInvite,
};
