export interface StravaAuthResult {
    email: string;
    token: string;
    username: string;
    avatar: string | null;
    name: string | null;
}

class StravaService {
    private readonly CLIENT_ID = process.env.AUTH_STRAVA_ID;
    private readonly CLIENT_SECRET = process.env.AUTH_STRAVA_SECRET;

    async exchangeToken(code: string): Promise<StravaAuthResult> {
        if (!this.CLIENT_ID || !this.CLIENT_SECRET) {
            throw new Error("Strava client ID or secret is not configured.");
        }

        const response = await fetch("https://www.strava.com/oauth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                client_id: this.CLIENT_ID,
                client_secret: this.CLIENT_SECRET,
                code: code,
                grant_type: "authorization_code",
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Strava token exchange failed: ${response.status} ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();

        // Strava athlete object typically has id, username, firstname, lastname, email, etc.
        // Note: email might not be present if scope doesn't include it, but usually standard auth gives some info.
        // If username is null, we can use firstname+lastname or id.
        const athlete = data.athlete;
        const email = athlete.email || `${athlete.id}@strava.com`; // Fallback email
        const username = athlete.username || `${athlete.firstname}${athlete.lastname}`.toLowerCase() || athlete.id.toString();
        const avatar = athlete.profile_medium || athlete.profile || null;
        const name = `${athlete.firstname} ${athlete.lastname}`.trim() || null;

        return {
            email,
            token: data.access_token,
            username,
            avatar,
            name,
        };
    }
}

export const stravaService = new StravaService();
