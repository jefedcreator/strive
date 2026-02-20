import { type RunData } from '@/types';
import { signOut } from '@/server/auth';

export interface StravaAuthResult {
  auth: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number; // Unix timestamp
    expiresIn: number; // Seconds
  };
  user: {
    stravaId: number;
    email: string;
    username: string;
    fullName: string | null;
    avatar: string | null;
  };
}

interface StravaTokenResponse {
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete?: any; // Only present in initial exchange, not refresh
}

export class StravaService {
  private readonly CLIENT_ID = process.env.AUTH_STRAVA_ID;
  private readonly CLIENT_SECRET = process.env.AUTH_STRAVA_SECRET;
  private readonly OAUTH_BASE_URL = 'https://www.strava.com/oauth';
  private readonly API_BASE_URL = 'https://www.strava.com/api/v3';

  constructor() {
    if (!this.CLIENT_ID || !this.CLIENT_SECRET) {
      console.warn(
        '⚠️ StravaService: Client ID or Secret is missing from environment variables.'
      );
    }
  }

  /**
   * Step 1: Generate the URL to redirect the user to Strava's consent screen.
   */
  getAuthorizationUrl(state?: {
    clubId?: string;
    inviteId?: string;
    leaderboardId?: string;
  }): string {
    const params = new URLSearchParams({
      client_id: this.CLIENT_ID!,
      redirect_uri: `${process.env.NODE_ENV == "production" ? "https://strive-beige.vercel.app" : "http://localhost:3000"}/api/login/callback`,
      response_type: 'code',
      approval_prompt: 'auto',
      scope: 'read,activity:read_all',
    });

    if (state) {
      params.append('state', JSON.stringify(state));
    }

    return `${this.OAUTH_BASE_URL}/authorize?${params.toString()}`;
  }

  /**
   * Step 2: Exchange the authorization code for an access token.
   */
  async exchangeToken(code: string): Promise<StravaAuthResult> {
    const response = await this.postRequest(
      '/token',
      {
        client_id: this.CLIENT_ID,
        client_secret: this.CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
      },
      true
    );

    return this.formatAuthResult(response);
  }

  /**
   * Step 3: Refresh an expired access token.
   */
  async refreshAccessToken(
    refreshToken: string
  ): Promise<Omit<StravaAuthResult, 'user'>> {
    const response = await this.postRequest(
      '/token',
      {
        client_id: this.CLIENT_ID,
        client_secret: this.CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      },
      true
    );

    return {
      auth: {
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expiresAt: response.expires_at,
        expiresIn: response.expires_in,
      },
    };
  }

  /**
   * Fetch activities for the authenticated athlete.
   * @param accessToken Valid Strava access token
   * @param page Page number
   * @param perPage Number of items per page
   */
  async fetchActivities(
    accessToken: string,
    page = 1,
    perPage = 30
  ): Promise<RunData[]> {
    const response = await fetch(
      `${this.API_BASE_URL}/athlete/activities?page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 401) {
      await signOut();
      throw new Error(
        'Strava access token expired or revoked. User has been logged out.'
      );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to fetch Strava activities: ${response.status} ${JSON.stringify(errorData)}`
      );
    }

    const activities = await response.json();

    // Return normalized data similar to NRC
    return activities.map((activity: any): RunData => {
      const distanceKm = activity.distance / 1000;
      const durationMin = activity.moving_time / 60;

      // Calculate pace: min/km
      let pace = '0:00';
      if (distanceKm > 0) {
        const totalSeconds = activity.moving_time / distanceKm;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.round(totalSeconds % 60);
        pace = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }

      return {
        id: activity.id.toString(),
        date: activity.start_date,
        distance: parseFloat(distanceKm.toFixed(2)),
        duration: parseFloat(durationMin.toFixed(2)),
        pace,
        type: activity.type,
        name: activity.name,
      };
    });
  }

  /**
   * Fetch all activities for the authenticated athlete by iterating through all pages.
   * @param accessToken Valid Strava access token
   */
  async fetchAllActivities(accessToken: string): Promise<RunData[]> {
    let allActivities: RunData[] = [];
    let page = 1;
    const perPage = 100;
    let hasMore = true;

    while (hasMore) {
      const activities = await this.fetchActivities(accessToken, page, perPage);
      if (activities.length === 0) {
        hasMore = false;
      } else {
        allActivities = [...allActivities, ...activities];
        page++;
        // If we got fewer activities than requested, it's likely the last page
        if (activities.length < perPage) {
          hasMore = false;
        }
      }
    }

    return allActivities;
  }

  // --- Private Helpers ---

  private async postRequest(
    endpoint: string,
    body: Record<string, any>,
    isOAuth = false
  ): Promise<StravaTokenResponse> {
    if (!this.CLIENT_ID || !this.CLIENT_SECRET) {
      throw new Error('Strava client ID or secret is not configured.');
    }

    const baseUrl = isOAuth ? this.OAUTH_BASE_URL : this.API_BASE_URL;
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Strava request failed: ${response.status} ${JSON.stringify(errorData)}`
      );
    }

    return response.json();
  }

  private formatAuthResult(data: StravaTokenResponse): StravaAuthResult {
    const { athlete } = data;

    // Normalize User Data
    let userProfile = {
      stravaId: 0,
      email: '',
      username: '',
      fullName: null as string | null,
      avatar: null as string | null,
    };

    if (athlete) {
      userProfile = {
        stravaId: athlete.id,
        // Fallback email logic (Strava rarely provides email unless specifically scoped/partnered)
        email: athlete.email ?? `${athlete.id}@strava.com`,
        username: athlete.username ?? `athlete_${athlete.id}`,
        fullName:
          `${athlete.firstname ?? ''} ${athlete.lastname ?? ''}`.trim() || null,
        avatar: athlete.profile_medium ?? athlete.profile ?? null,
      };
    }

    return {
      auth: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at,
        expiresIn: data.expires_in,
      },
      user: userProfile,
    };
  }
}

export const stravaService = new StravaService();
