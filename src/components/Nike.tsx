"use client";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

const NikeOAuthApp = () => {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<any>(false);
  const [error, setError] = useState<any>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Replace these with your actual Nike app credentials
  const CLIENT_ID = process.env.AUTH_NIKE_CLIENT_ID ?? "your_nike_client_id_here";
  const CLIENT_SECRET =
    process.env.AUTH_NIKE_SECRET ?? "your_nike_client_secret_here";
  const REDIRECT_URI =
    typeof window !== "undefined" ? window.location.origin : "";
  const SCOPE = "openid profile email nike.running.read";

  // Check for OAuth callback on component mount
  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state");

    // We can use state to distinguish between providers if they both use the same redirect URI
    if (state === "nike") {
      if (error) {
        setError("Authentication failed: " + error);
        router.replace("/");
      } else if (code) {
        exchangeToken(code).catch((err) => {
          setError("Authentication failed: " + err.message);
        });
      }
    }
  }, [searchParams, router, exchangeToken]);

  // Step 1: Redirect to Nike authorization
  const initiateNikeAuth = () => {
    if (typeof window === "undefined") return;

    const authUrl =
      `https://api.nike.com/v1/auth/authorize?` +
      `client_id=${CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(SCOPE)}&` +
      `state=nike`;

    window.location.href = authUrl;
  };

  // Step 2: Exchange authorization code for access token
  const exchangeToken = useCallback(async (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("https://api.nike.com/v1/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code: code,
          grant_type: "authorization_code",
          redirect_uri: REDIRECT_URI,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setAccessToken(data.access_token);
      
      // Nike user profile request (hypothetical endpoint)
      const userResponse = await fetch("https://api.nike.com/v1/me", {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      } else {
        // Fallback or just use data from token if available
        setUser({ name: "Nike User", profile_image: null });
      }

      // Clean up URL after successful authentication
      router.replace("/");
    } catch (err: any) {
      setError("Failed to exchange token: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, router]);

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
            Nike Run Club OAuth
          </h1>
          <p className="mb-8 text-gray-600">Connect your Nike account</p>

          {error && (
            <div className="mb-6 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="mb-6 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-black"></div>
              <span className="ml-2 text-gray-600">Authenticating...</span>
            </div>
          )}

          {!user && !isLoading && (
            <div>
              <button
                onClick={initiateNikeAuth}
                className="mx-auto flex items-center justify-center rounded-lg bg-black px-6 py-3 font-bold text-white transition duration-200 hover:bg-gray-900"
              >
                <svg
                  className="mr-2 h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                   <path d="M21 8.75c-2.5 1.5-5.5 2.5-8 2.5s-4.5-0.5-6-1.5c-1.5-1-2.5-2.5-3-4.5-0.5-2 0-3.5 1.5-4 1.5-0.5 3.5 0.5 5.5 2 2 1.5 3.5 3.5 4.5 5.5 1 2 1.5 4.5 1.5 7.5 0 1-0.5 1.5-1.5 1.5s-1.5-0.5-1.5-1.5c0-2 0-4-0.5-5.5s-1.5-2.5-2.5-3.5c-1-1-2.5-1.5-4-1.5s-2.5 0.5-3.5 1.5c-1 1-1.5 2.5-1.5 4s0.5 2.5 1.5 3.5c1 1 2.5 1.5 4 1.5s2.5-0.5 3.5-1.5c1-1 1.5-2.5 1.5-4 0-1.5-0.5-2.5-1.5-3.5z" />
                </svg>
                Connect with Nike
              </button>

              <div className="mt-6 text-sm text-gray-500">
                <p className="mb-2 font-semibold">Setup Instructions:</p>
                <ol className="space-y-1 text-left">
                  <li>
                    1. Replace CLIENT_ID and CLIENT_SECRET with your values
                  </li>
                  <li>
                    2. Ensure your Nike app&apos;s redirect URI matches this
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
                {user.profile_image ? (
                  <Image
                    src={user.profile_image}
                    alt="Profile"
                    className="mx-auto mb-4 h-20 w-20 rounded-full border-4 border-gray-200"
                    width={100}
                    height={100}
                  />
                ) : (
                   <div className="mx-auto mb-4 h-20 w-20 rounded-full border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-2xl font-bold">{user.name?.[0]}</span>
                   </div>
                )}
                <h2 className="text-2xl font-bold text-gray-800">
                  {user.name ?? (user.firstname + " " + user.lastname)}
                </h2>
                {user.email && <p className="text-gray-600">{user.email}</p>}
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

export default NikeOAuthApp;
