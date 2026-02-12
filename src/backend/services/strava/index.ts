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
    private readonly BASE_URL = "https://www.strava.com/oauth";

    // console.log('CLIENT_ID', CLIENT_ID);


    constructor() {
        if (!this.CLIENT_ID || !this.CLIENT_SECRET) {
            console.warn("⚠️ StravaService: Client ID or Secret is missing from environment variables.");
        }
    }

    /**
     * Step 1: Generate the URL to redirect the user to Strava's consent screen.
     * @param redirectUri The callback URL where Strava will send the code (must match Strava app settings)
     * @param scopes Comma-separated scopes (e.g., 'read,activity:read')
     */
    getAuthorizationUrl(): string {
        const params = new URLSearchParams({
            client_id: this.CLIENT_ID!,
            redirect_uri: "http://localhost:3000/api/login/strava/callback",
            response_type: 'code',
            approval_prompt: 'auto',
            scope: "read,activity:read_all",
        });

        return `${this.BASE_URL}/authorize?${params.toString()}`;
    }

    /**
     * Step 2: Exchange the authorization code for an access token.
     */
    async exchangeToken(code: string): Promise<StravaAuthResult> {
        const response = await this.postRequest('/token', {
            client_id: this.CLIENT_ID,
            client_secret: this.CLIENT_SECRET,
            code: code,
            grant_type: "authorization_code",
        });

        return this.formatAuthResult(response);
    }

    /**
     * Step 3: Refresh an expired access token.
     * Strava tokens expire after 6 hours. You must store the refresh_token to keep the user logged in.
     */
    async refreshAccessToken(refreshToken: string): Promise<Omit<StravaAuthResult, 'user'>> {
        const response = await this.postRequest('/token', {
            client_id: this.CLIENT_ID,
            client_secret: this.CLIENT_SECRET,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
        });

        // Refresh response does NOT return the athlete object, only tokens.
        return {
            auth: {
                accessToken: response.access_token,
                refreshToken: response.refresh_token,
                expiresAt: response.expires_at,
                expiresIn: response.expires_in,
            },
        };
    }

    // --- Private Helpers ---

    private async postRequest(endpoint: string, body: Record<string, any>): Promise<StravaTokenResponse> {
        if (!this.CLIENT_ID || !this.CLIENT_SECRET) {
            throw new Error("Strava client ID or secret is not configured.");
        }

        const response = await fetch(`${this.BASE_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Strava request failed: ${response.status} ${JSON.stringify(errorData)}`);
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
            avatar: null as string | null
        };

        if (athlete) {
            userProfile = {
                stravaId: athlete.id,
                // Fallback email logic (Strava rarely provides email unless specifically scoped/partnered)
                email: athlete.email ?? `${athlete.id}@strava.com`,
                username: athlete.username ?? `athlete_${athlete.id}`,
                fullName: `${athlete.firstname ?? ''} ${athlete.lastname ?? ''}`.trim() || null,
                avatar: (athlete.profile_medium ?? athlete.profile) ?? null,
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
