"use client";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

const StravaOAuthApp = () => {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<any>(false);
  const [error, setError] = useState<any>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Replace these with your actual Strava app credentials
  const CLIENT_ID = process.env.AUTH_STRAVA_CLIENT_ID ?? "your_client_id_here";
  const REDIRECT_URI =
    typeof window !== "undefined" ? window.location.origin : "";
  const SCOPE = "read,activity:read_all";

  // Check for OAuth callback on component mount
  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state");

    if (state === "strava") {
      if (error) {
        setError("Authentication failed: " + error);
        // Clean up URL
        router.replace("/");
      } else if (code) {
        exchangeToken(code).catch((err) => {
          setError("Authentication failed: " + err.message);
        });
      }
    }
  }, [searchParams, router, exchangeToken]);

  // Step 1: Redirect to Strava authorization
  const initiateStravaAuth = () => {
    if (typeof window === "undefined") return;

    const authUrl =
      `https://www.strava.com/oauth/authorize?` +
      `client_id=${CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `response_type=code&` +
      `approval_prompt=force&` +
      `scope=${SCOPE}&` +
      `state=strava`;

    window.location.href = authUrl;
  };

  // Step 2: Exchange authorization code for access token via backend
  const exchangeToken = useCallback(async (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "strava",
          code: code,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const { data } = result;

      // The backend returns the user object which includes the token and other details
      setAccessToken(data.access_token);
      setUser(data);

      // Clean up URL after successful authentication
      router.replace("/");
    } catch (err: any) {
      setError("Failed to exchange token: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Logout function
  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setError(null);
  };

  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            Strava OAuth Demo
          </h1>
          <p className="mb-8 text-gray-600">Connect your Strava account</p>

          {error && (
            <div className="mb-6 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="mb-6 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500"></div>
              <span className="ml-2 text-gray-600">Authenticating...</span>
            </div>
          )}

          {!user && !isLoading && (
            <div>
              <button
                onClick={initiateStravaAuth}
                className="mx-auto flex items-center justify-center rounded-lg bg-orange-500 px-6 py-3 font-bold text-white transition duration-200 hover:bg-orange-600"
              >
                <svg
                  className="mr-2 h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.172" />
                </svg>
                Connect with Strava
              </button>

              <div className="mt-6 text-sm text-gray-500">
                <p className="mb-2 font-semibold">Setup Instructions:</p>
                <ol className="space-y-1 text-left">
                  <li>
                    1. Replace CLIENT_ID and CLIENT_SECRET with your values
                  </li>
                  <li>
                    2. Ensure your Strava app&apos;s redirect URI matches this
                    domain
                  </li>
                  <li>3. Click the button above to authenticate</li>
                </ol>
              </div>
            </div>
          )}

          {user && (
            <div className="text-center">
              <div className="mb-6">
                <Image
                  src={user.avatar ?? "/placeholder-avatar.png"}
                  alt="Profile"
                  className="mx-auto mb-4 h-20 w-20 rounded-full border-4 border-orange-200"
                  width={100}
                  height={100}
                />
                <h2 className="text-2xl font-bold text-gray-800">
                  {user.name || user.username}
                </h2>
                <p className="text-gray-600">@{user.username}</p>
                {user.city && (
                  <p className="mt-2 text-sm text-gray-500">
                    {user.city}, {user.state} {user.country}
                  </p>
                )}
              </div>

              <div className="mb-6 rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 font-semibold text-gray-800">
                  Authentication Success!
                </h3>
                <p className="text-sm text-gray-600">
                  Access Token: {accessToken?.substring(0, 20)}...
                </p>
              </div>

              <button
                onClick={logout}
                className="rounded bg-gray-500 px-4 py-2 font-bold text-white transition duration-200 hover:bg-gray-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StravaOAuthApp;
