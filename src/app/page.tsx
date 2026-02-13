"use client";

import { useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/primitives";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { LoginValidatorSchema } from "@/backend/validators/auth.validator";

interface LoginResponse {
  status: number;
  data: {
    id: string;
    username: string;
    email: string;
    token: string;
    expiresAt: string;
  };
  action?: "redirect";
  url?: string;
}

// Strava Logo SVG
const StravaLogo = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.172" />
  </svg>
);

// Nike Logo SVG (Swoosh)
const NikeLogo = () => (
  <svg className="h-5 w-5" viewBox="135.5 361.38 1000 356.39" fill="currentColor">
    <path d="M245.8075 717.62406c-29.79588-1.1837-54.1734-9.3368-73.23459-24.4796-3.63775-2.8928-12.30611-11.5663-15.21427-15.2245-7.72958-9.7193-12.98467-19.1785-16.48977-29.6734-10.7857-32.3061-5.23469-74.6989 15.87753-121.2243 18.0765-39.8316 45.96932-79.3366 94.63252-134.0508 7.16836-8.0511 28.51526-31.5969 28.65302-31.5969.051 0-1.11225 2.0153-2.57652 4.4694-12.65304 21.1938-23.47957 46.158-29.37751 67.7703-9.47448 34.6785-8.33163 64.4387 3.34693 87.5151 8.05611 15.898 21.86731 29.6684 37.3979 37.2806 27.18874 13.3214 66.9948 14.4235 115.60699 3.2245 3.34694-.7755 169.19363-44.801 368.55048-97.8366 199.35686-53.0408 362.49439-96.4029 362.51989-96.3672.056.046-463.16259 198.2599-703.62654 299.9999-240.46395 101.7401-437.2653 185.9948-437.3366 185.9948-.0713 0-1.29592-.5153-2.72448-1.1428z" />
  </svg>
);

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await fetch("/api/auth/session");
      return res.json();
    },
  });

  useEffect(() => {
    if (session?.user) {
      router.replace("/home");
    }
  }, [session, router]);

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginValidatorSchema) => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to authenticate");
      }

      return response.json() as Promise<LoginResponse>;
    },
    onSuccess: (result, variables) => {
      if (result.action === "redirect" && result.url) {
        window.location.href = result.url;
        return;
      }

      if (result.data?.username) {
        toast.success(`Welcome back, ${result.data.username}!`);
        router.push("/home");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const exchangeStravaToken = useCallback(
    (code: string) => {
      loginMutation.mutate({ type: "strava", code });
    },
    [loginMutation],
  );

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    if (state === "strava" && code) {
      exchangeStravaToken(code);
    }
  }, [searchParams, exchangeStravaToken]);

  const handleStravaLogin = () => {
    loginMutation.mutate({ type: "strava" });
  };

  const handleNRCLogin = () => {
    toast.promise(loginMutation.mutateAsync({ type: "nrc" }), {
      loading: "Opening Nike login window... Please log in there.",
      success: (result) => {
        router.push("/home");
        return `Welcome, ${result.data.username}!`;
      },
      error: (err) => err.message,
    });
  };

  const isLoading = loginMutation.isPending;
  const loadingType = loginMutation.variables?.type;

  if (isSessionLoading || session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] p-6 text-slate-900">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 space-y-8 text-center duration-1000">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            STRIVE
          </h1>
          <p className="font-medium text-slate-500">
            Sync your fitness journey across platforms.
          </p>
        </div>

        <div className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/60 transition-all hover:shadow-slate-200/80">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-2xl bg-slate-900 p-4 shadow-lg">
            <div className="flex gap-2">
              <div className="h-2 w-2 rounded-full bg-red-400" />
              <div className="h-2 w-2 rounded-full bg-orange-400" />
              <div className="h-2 w-2 rounded-full bg-green-400" />
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <Button
              variant="primary"
              isFullWidth
              onClick={handleStravaLogin}
              disabled={isLoading}
              className="h-14 bg-[#FC6100] hover:bg-[#E35700] active:scale-[0.98]"
            >
              <StravaLogo />
              <span>
                {isLoading && loadingType === "strava"
                  ? "Connecting..."
                  : "Sign in with Strava"}
              </span>
            </Button>

            <div className="flex items-center gap-4 py-2">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                or
              </span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <Button
              variant="primary"
              isFullWidth
              onClick={handleNRCLogin}
              disabled={isLoading}
              className="h-14 bg-black hover:bg-zinc-800 active:scale-[0.98]"
            >
              <NikeLogo />
              <span>
                {isLoading && loadingType === "nrc"
                  ? "Authenticating..."
                  : "Sign in with NRC"}
              </span>
            </Button>
          </div>

          <p className="mt-8 text-xs text-slate-400">
            By connecting, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </main>
  );
}
