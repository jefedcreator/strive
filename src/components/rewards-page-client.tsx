'use client';

import { FadeInItem, FadeInStagger } from '@/components/fade-in';
import { Button } from '@/primitives/Button';
import { type ApiResponse } from '@/types';
import { useQuery } from '@tanstack/react-query';
import api from '@/utils/axios';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Trophy,
  Download,
  Share2,
  Shield,
  Medal,
  X,
  Flame,
  Zap,
} from 'lucide-react';
import { Modal } from '@/primitives/Modal';

interface RewardItem {
  id: string;
  rewardId: string;
  type: 'GOLD' | 'SILVER' | 'BRONZE' | 'CLUB_MILESTONE';
  title: string;
  description: string | null;
  earnedAt: string;
  leaderboard: { id: string; name: string; clubId: string | null } | null;
  club: { id: string; name: string; slug: string } | null;
  milestone: number | null;
  badgeUrl: string;
}

interface RewardsData {
  rewards: RewardItem[];
  xp: number;
  currentStreak: number;
  longestStreak: number;
  tier: { name: string; emoji: string; threshold: number };
  nextTier: { name: string; emoji: string; threshold: number } | null;
  tierBadgeUrl: string;
}

const typeStyles: Record<
  string,
  { border: string; bg: string; label: string; icon: typeof Trophy }
> = {
  GOLD: {
    border: 'border-yellow-400/40',
    bg: 'bg-yellow-400/5',
    label: '1st Place',
    icon: Trophy,
  },
  SILVER: {
    border: 'border-gray-400/40',
    bg: 'bg-gray-400/5',
    label: '2nd Place',
    icon: Medal,
  },
  BRONZE: {
    border: 'border-orange-700/40',
    bg: 'bg-orange-700/5',
    label: '3rd Place',
    icon: Medal,
  },
  CLUB_MILESTONE: {
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/5',
    label: 'Club Milestone',
    icon: Shield,
  },
};

export const RewardsPageClient: React.FC = () => {
  const { data: session } = useSession();
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);

  const { data, isLoading } = useQuery<
    ApiResponse<RewardsData>,
    Error,
    RewardsData
  >({
    queryKey: ['rewards'],
    queryFn: async () => {
      const res = await api.get('/rewards', {
        headers: { Authorization: `Bearer ${session?.user.token}` },
      });
      return res.data;
    },
    select: (response) =>
      response?.data ?? {
        rewards: [],
        xp: 0,
        currentStreak: 0,
        longestStreak: 0,
        tier: { name: 'Pacer', emoji: '🥉', threshold: 0 },
        nextTier: { name: 'Racer', emoji: '🥈', threshold: 1000 },
        tierBadgeUrl: '',
      },
    enabled: !!session?.user?.id,
  });

  const rewards = data?.rewards ?? [];
  const xp = data?.xp ?? 0;
  const currentStreak = data?.currentStreak ?? 0;
  const longestStreak = data?.longestStreak ?? 0;
  const tier = data?.tier ?? { name: 'Pacer', emoji: '🥉', threshold: 0 };
  const nextTier = data?.nextTier;
  const tierBadgeUrl = data?.tierBadgeUrl ?? '';

  // XP progress to next tier
  const xpProgress = nextTier
    ? Math.min(
        ((xp - tier.threshold) / (nextTier.threshold - tier.threshold)) * 100,
        100
      )
    : 100;

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `strive-${name.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = (rewardId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/rewards/${rewardId}`);
    toast.success('Badge link copied to clipboard!');
  };

  return (
    <FadeInStagger className="flex flex-col w-full min-w-0 h-full px-0 mt-20 lg:mt-0 pb-10">
      {/* Header */}
      <FadeInItem>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              My Rewards
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Your XP, tier, earned badges, and achievements.
            </p>
          </div>
        </div>
      </FadeInItem>

      {/* ─── XP & Tier Section ──────────────────────────────────────────── */}
      {!isLoading && (
        <FadeInItem>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {/* Tier Card with Badge */}
            <div className="md:col-span-1 bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col items-center text-center relative overflow-hidden">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

              <div className="relative w-32 h-32 rounded-full bg-gray-900 overflow-hidden mb-4 ring-2 ring-primary/20 shadow-xl">
                {tierBadgeUrl && (
                  <Image
                    src={tierBadgeUrl}
                    alt={tier.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                )}
              </div>

              <div className="text-4xl mb-1">{tier.emoji}</div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                {tier.name}
              </h2>
              <p className="text-sm font-bold text-primary mt-1">
                {xp.toLocaleString()} XP
              </p>

              {/* Progress to next tier */}
              {nextTier && (
                <div className="w-full mt-4">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5">
                    <span>{tier.emoji} {tier.name}</span>
                    <span>{nextTier.emoji} {nextTier.name}</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-500"
                      style={{ width: `${xpProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 text-right">
                    {(nextTier.threshold - xp).toLocaleString()} XP to go
                  </p>
                </div>
              )}

              {/* Download / Share tier badge */}
              <div className="flex gap-2 mt-4 w-full">
                <button
                  onClick={() => handleDownload(tierBadgeUrl, `tier-${tier.name}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}${tierBadgeUrl}`);
                    toast.success('Tier badge link copied!');
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              {/* XP Total */}
              <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    Total XP
                  </span>
                </div>
                <p className="text-3xl font-black text-gray-900 dark:text-white">
                  {xp.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Experience Points
                </p>
              </div>

              {/* Current Streak */}
              <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Flame className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    Current Streak
                  </span>
                </div>
                <p className="text-3xl font-black text-gray-900 dark:text-white">
                  {currentStreak}
                  <span className="text-base font-bold text-gray-400 ml-1">
                    {currentStreak === 1 ? 'week' : 'weeks'}
                  </span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Best: {longestStreak} {longestStreak === 1 ? 'week' : 'weeks'}
                </p>
              </div>

              {/* Rewards Earned */}
              <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    Rewards
                  </span>
                </div>
                <p className="text-3xl font-black text-gray-900 dark:text-white">
                  {rewards.length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Badges earned
                </p>
              </div>

              {/* Iron Runner Progress */}
              <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    Iron Runner
                  </span>
                </div>
                <p className="text-3xl font-black text-gray-900 dark:text-white">
                  {Math.min(longestStreak, 4)}
                  <span className="text-base font-bold text-gray-400 ml-1">
                    / 4
                  </span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {longestStreak >= 4 ? '🏅 Earned!' : `${4 - Math.min(longestStreak, 4)} weeks to go`}
                </p>
              </div>
            </div>
          </div>
        </FadeInItem>
      )}

      {/* ─── Tier Progression ───────────────────────────────────────────── */}
      {!isLoading && (
        <FadeInItem>
          <div className="mb-10">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
              Runner Tiers
            </h2>
            <div className="flex items-center gap-0 overflow-x-auto pb-2">
              {[
                { name: 'Pacer', emoji: '🥉', threshold: 0 },
                { name: 'Racer', emoji: '🥈', threshold: 1_000 },
                { name: 'Contender', emoji: '🥇', threshold: 5_000 },
                { name: 'Elite', emoji: '💎', threshold: 15_000 },
                { name: 'Legend', emoji: '👑', threshold: 50_000 },
              ].map((t, i, arr) => {
                const isActive = xp >= t.threshold;
                const isCurrent = tier.name === t.name;
                return (
                  <React.Fragment key={t.name}>
                    <div
                      className={`flex flex-col items-center min-w-[80px] ${
                        isCurrent
                          ? 'scale-110'
                          : isActive
                            ? 'opacity-100'
                            : 'opacity-40'
                      } transition-all`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                          isCurrent
                            ? 'bg-primary/10 ring-2 ring-primary shadow-lg'
                            : 'bg-gray-100 dark:bg-white/5'
                        }`}
                      >
                        {t.emoji}
                      </div>
                      <span className="text-[10px] font-bold mt-1.5 text-gray-700 dark:text-gray-300">
                        {t.name}
                      </span>
                      <span className="text-[9px] text-gray-400">
                        {t.threshold.toLocaleString()} XP
                      </span>
                    </div>
                    {i < arr.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 min-w-[20px] mx-1 rounded ${
                          xp >= arr[i + 1]!.threshold
                            ? 'bg-primary'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </FadeInItem>
      )}

      {/* ─── Earned Badges Grid ─────────────────────────────────────────── */}
      <FadeInItem>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">
            Earned Badges
          </h2>
          <span className="text-xs font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500">
            {rewards.length} {rewards.length === 1 ? 'Badge' : 'Badges'}
          </span>
        </div>
      </FadeInItem>

      {/* Loading state */}
      {isLoading && (
        <FadeInItem>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse"
              />
            ))}
          </div>
        </FadeInItem>
      )}

      {/* Empty state */}
      {!isLoading && rewards.length === 0 && (
        <FadeInItem>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              No badges yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              Finish in the top 3 of a leaderboard or challenge to earn your first badge.
            </p>
          </div>
        </FadeInItem>
      )}

      {/* Rewards Grid */}
      {rewards.length > 0 && (
        <FadeInItem>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => {
              const style = typeStyles[reward.type] ?? typeStyles.GOLD!;
              const IconComponent = style.icon;

              return (
                <div
                  key={reward.id}
                  className={`group relative rounded-2xl border ${style.border} ${style.bg} p-1 transition-all hover:scale-[1.02] hover:shadow-xl cursor-pointer`}
                  onClick={() => setSelectedReward(reward)}
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-900">
                    <Image
                      src={reward.badgeUrl}
                      alt={reward.title}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                        {style.label}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {reward.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(reward.earnedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  {/* Quick hover actions */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(reward.badgeUrl, reward.title);
                      }}
                      className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyLink(reward.id);
                      }}
                      className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </FadeInItem>
      )}

      {/* ─── Detail Modal ───────────────────────────────────────────────── */}
      <Modal
        open={!!selectedReward}
        onOpenChange={(open) => {
          if (!open) setSelectedReward(null);
        }}
      >
        <Modal.Portal>
          <Modal.Content className="fixed top-1/2 left-1/2 w-[95vw] max-w-[550px] bg-card-light dark:bg-card-dark rounded-2xl p-0 border border-gray-200 dark:border-gray-800 shadow-2xl z-[100] transform -translate-x-1/2 -translate-y-1/2 overflow-hidden flex flex-col">
            {selectedReward && (
              <>
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <Modal.Title className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedReward.title}
                  </Modal.Title>
                  <Modal.Close className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <X className="w-5 h-5" />
                  </Modal.Close>
                </div>
                <div className="p-6 flex flex-col items-center gap-6">
                  <div className="relative aspect-square w-full max-w-[350px] rounded-2xl overflow-hidden bg-gray-900 shadow-2xl ring-1 ring-white/10">
                    <Image
                      src={selectedReward.badgeUrl}
                      alt={selectedReward.title}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  {selectedReward.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
                      {selectedReward.description}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-4 w-full max-w-[350px]">
                    <Button
                      onClick={() =>
                        handleDownload(selectedReward.badgeUrl, selectedReward.title)
                      }
                      className="flex items-center justify-center gap-2 py-5"
                    >
                      <Download className="w-5 h-5" />
                      Download
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleCopyLink(selectedReward.id)}
                      className="flex items-center justify-center gap-2 py-5"
                    >
                      <Share2 className="w-5 h-5" />
                      Copy Link
                    </Button>
                  </div>
                </div>
                <div className="p-3 bg-primary/5 border-t border-primary/10 text-center">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-primary/70">
                    Share your badge on Instagram/X and tag @strive
                  </p>
                </div>
              </>
            )}
          </Modal.Content>
        </Modal.Portal>
      </Modal>
    </FadeInStagger>
  );
};
