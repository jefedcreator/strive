'use client';

import { FadeInItem, FadeInStagger } from '@/components/fade-in';
import { useInfiniteScroll } from '@/hooks/useinfiniteScroll';
import { Button } from '@/primitives/Button';
import { Modal } from '@/primitives/Modal';
import {
  type PaginatedApiResponse,
  type RewardItem,
  type RewardsData,
} from '@/types';
import { baseParams } from '@/utils';
import {
  Download,
  Flame,
  Loader2,
  Medal,
  Share2,
  Shield,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import { useQueryStates } from 'nuqs';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface RewardsPageClientProps {
  initialData: PaginatedApiResponse<RewardsData>;
  currentFilters: {
    page: number | null;
  };
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

export const RewardsPageClient: React.FC<RewardsPageClientProps> = ({
  initialData,
  currentFilters,
}) => {
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [{ page }, setStates] = useQueryStates(baseParams, {
    shallow: false,
    throttleMs: 1000,
  });

  const isPaging = page !== currentFilters.page;

  // Use infinite scroll for the rewards list
  const { items, ref, hasNextPage } = useInfiniteScroll<RewardItem>({
    data: {
      ...initialData,
      data: initialData.data.data,
    },
    page: page ?? 1,
    setPage: (p) => setStates({ page: p }),
    refresh: refreshKey,
  });

  // Use initial stats (which contain xp, streak, tier info)
  const stats = initialData.data;
  const xp = stats.xp;
  const currentStreak = stats.currentStreak;
  const longestStreak = stats.longestStreak;
  const tier = stats.tier;
  const nextTier = stats.nextTier;
  const tierBadgeUrl = stats.tierBadgeUrl;

  // Total count of unique rewards earned (can be across all pages or just what's loaded)
  // For UI display, we can use the total from the paginated response
  const totalRewardsCount = initialData.total;

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
    navigator.clipboard.writeText(
      `${window.location.origin}/rewards/${rewardId}`
    );
    toast.success('Badge link copied to clipboard!');
  };

  // If we're loading the VERY first set of data (only happens if initialData was missing or we're on a non-page-1 start)
  const isActuallyLoading = isPaging && !items.length;

  return (
    <FadeInStagger className="flex flex-col h-full">
      {/* Header */}
      <FadeInItem>
        <div className="mb-6 md:mb-10 mt-16 lg:mt-0">
          <nav className="flex text-sm text-gray-500 dark:text-gray-400 mb-2 md:hidden">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span className="text-primary dark:text-white font-medium">
              Rewards
            </span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                My Rewards
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base mt-1">
                Your XP, tier, earned badges, and achievements.
              </p>
            </div>
          </div>
        </div>
      </FadeInItem>

      {/* ─── XP & Tier Section ──────────────────────────────────────────── */}
      <FadeInItem>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
          {/* Tier Card with Badge */}
          <div className="md:col-span-1 bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-5 md:p-6 flex flex-col items-center text-center relative overflow-hidden">
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
                  <span>
                    {tier.emoji} {tier.name}
                  </span>
                  <span>
                    {nextTier.emoji} {nextTier.name}
                  </span>
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
                onClick={() =>
                  handleDownload(tierBadgeUrl, `tier-${tier.name}`)
                }
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}${tierBadgeUrl}`
                  );
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
          <div className="md:col-span-2 grid grid-cols-2 gap-3 md:gap-4">
            {/* XP Total */}
            <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-2 md:mb-3">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                </div>
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Total XP
                </span>
              </div>
              <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                {xp.toLocaleString()}
              </p>
              <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-0.5 md:mt-1">
                Experience Points
              </p>
            </div>

            {/* Current Streak */}
            <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-2 md:mb-3">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Flame className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-500" />
                </div>
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Current Streak
                </span>
              </div>
              <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                {currentStreak}
                <span className="text-sm md:text-base font-bold text-gray-400 ml-1">
                  {currentStreak === 1 ? 'week' : 'weeks'}
                </span>
              </p>
              <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-0.5 md:mt-1">
                Best: {longestStreak} {longestStreak === 1 ? 'week' : 'weeks'}
              </p>
            </div>

            {/* Rewards Earned */}
            <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-2 md:mb-3">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Trophy className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-500" />
                </div>
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Rewards
                </span>
              </div>
              <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                {totalRewardsCount}
              </p>
              <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-0.5 md:mt-1">
                Badges earned
              </p>
            </div>

            {/* Iron Runner Progress */}
            <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-2 md:mb-3">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500" />
                </div>
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Iron Runner
                </span>
              </div>
              <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                {Math.min(longestStreak, 4)}
                <span className="text-sm md:text-base font-bold text-gray-400 ml-1">
                  / 4
                </span>
              </p>
              <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-0.5 md:mt-1">
                {longestStreak >= 4
                  ? '🏅 Earned!'
                  : `${4 - Math.min(longestStreak, 4)} weeks to go`}
              </p>
            </div>
          </div>
        </div>
      </FadeInItem>

      {/* ─── Tier Progression ───────────────────────────────────────────── */}
      <FadeInItem>
        <div className="mb-6 md:mb-10 overflow-hidden">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
            Runner Tiers
          </h2>
          <div className="flex items-center gap-0 pb-2">
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
                    className={`flex flex-col items-center shrink-0 w-[56px] md:w-[80px] ${
                      isCurrent
                        ? 'scale-110'
                        : isActive
                          ? 'opacity-100'
                          : 'opacity-40'
                    } transition-all`}
                  >
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg md:text-xl ${
                        isCurrent
                          ? 'bg-primary/10 ring-2 ring-primary shadow-lg'
                          : 'bg-gray-100 dark:bg-white/5'
                      }`}
                    >
                      {t.emoji}
                    </div>
                    <span className="text-[9px] md:text-[10px] font-bold mt-1 md:mt-1.5 text-gray-700 dark:text-gray-300">
                      {t.name}
                    </span>
                    <span className="text-[8px] md:text-[9px] text-gray-400">
                      {t.threshold.toLocaleString()} XP
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 min-w-[12px] md:min-w-[20px] mx-0.5 md:mx-1 rounded ${
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

      {/* ─── Earned Badges Grid ─────────────────────────────────────────── */}
      <FadeInItem>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">
            Earned Badges
          </h2>
          <span className="text-xs font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500">
            {totalRewardsCount} {totalRewardsCount === 1 ? 'Badge' : 'Badges'}
          </span>
        </div>
      </FadeInItem>

      {/* Loading state (initial) */}
      {isActuallyLoading && (
        <FadeInItem>
          <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6 pb-20 md:pb-0">
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
      {!isActuallyLoading && items.length === 0 && (
        <FadeInItem>
          <div className="flex flex-col items-center justify-center py-12 md:py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              No badges yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              Finish in the top 3 of a leaderboard or challenge to earn your
              first badge.
            </p>
          </div>
        </FadeInItem>
      )}

      {/* Rewards Grid */}
      {!isActuallyLoading && items.length > 0 && (
        <>
          <FadeInStagger
            key={`rewards-${refreshKey}`}
            className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6 pb-20 md:pb-0"
          >
            {items.map((reward) => {
              const style = typeStyles[reward.type] ?? typeStyles.GOLD!;
              const IconComponent = style.icon;

              return (
                <FadeInItem key={reward.id}>
                  <div
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
                    <div className="p-2.5 md:p-4">
                      <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
                        <IconComponent className="w-3 h-3 md:w-4 md:h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider md:tracking-widest text-gray-400 dark:text-gray-500">
                          {style.label}
                        </span>
                      </div>
                      <h3 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white truncate">
                        {reward.title}
                      </h3>
                      <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-0.5 md:mt-1">
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
                </FadeInItem>
              );
            })}
          </FadeInStagger>

          {/* Intersection Observer target element */}
          {hasNextPage && (
            <div ref={ref} className="flex justify-center py-8 col-span-full">
              {isPaging && (
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              )}
            </div>
          )}
        </>
      )}

      {/* ─── Detail Modal ───────────────────────────────────────────────── */}
      <Modal
        open={!!selectedReward}
        onOpenChange={(open) => {
          if (!open) setSelectedReward(null);
        }}
      >
        <Modal.Portal>
          <Modal.Content className="fixed top-1/2 left-1/2 w-[95vw] sm:w-[85vw] max-w-[550px] bg-card-light dark:bg-card-dark rounded-2xl md:rounded-3xl p-0 border border-gray-200 dark:border-gray-800 shadow-2xl z-[100] transform -translate-x-1/2 -translate-y-1/2 overflow-hidden flex flex-col max-h-[90vh]">
            {selectedReward && (
              <>
                <div className="p-4 md:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <Modal.Title className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                    {selectedReward.title}
                  </Modal.Title>
                  <Modal.Close className="rounded-full p-1.5 md:p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <X className="w-5 h-5" />
                  </Modal.Close>
                </div>
                <div className="p-4 md:p-6 flex flex-col items-center gap-4 md:gap-6 overflow-y-auto">
                  <div className="relative aspect-square w-full max-w-[280px] md:max-w-[350px] rounded-2xl overflow-hidden bg-gray-900 shadow-2xl ring-1 ring-white/10 shrink-0">
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
                        handleDownload(
                          selectedReward.badgeUrl,
                          selectedReward.title
                        )
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
