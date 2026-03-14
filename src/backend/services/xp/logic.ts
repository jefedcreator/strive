import { type RunData } from '@/types';

// ─── Tier Definitions ──────────────────────────────────────────────────────────

export const TIERS = [
  { name: 'Legend', emoji: '👑', threshold: 50_000, color: '#FFD700' },
  { name: 'Elite', emoji: '💎', threshold: 15_000, color: '#60A5FA' },
  { name: 'Contender', emoji: '🥇', threshold: 5_000, color: '#F59E0B' },
  { name: 'Racer', emoji: '🥈', threshold: 1_000, color: '#9CA3AF' },
  { name: 'Pacer', emoji: '🥉', threshold: 0, color: '#CD7F32' },
] as const;

export type TierInfo = (typeof TIERS)[number];

/**
 * Get the tier for a given XP amount.
 */
export function getTier(xp: number): TierInfo {
  for (const tier of TIERS) {
    if (xp >= tier.threshold) return tier;
  }
  return TIERS[TIERS.length - 1]!;
}

/**
 * Get the next tier (for progress bar).
 */
export function getNextTier(xp: number): TierInfo | null {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (TIERS[i]!.threshold > xp) return TIERS[i]!;
  }
  return null; // Already at max tier
}

// ─── XP Calculation ────────────────────────────────────────────────────────────

const XP_PER_KM = 100;
const XP_PER_MIN = 2;
const STREAK_BONUS = 50; // per consecutive week

/**
 * Calculate XP for a batch of runs.
 */
export function calculateRunXP(runs: RunData[], currentStreak: number): number {
  const baseXP = runs.reduce((sum, run) => {
    return (
      sum +
      Math.round(run.distance * XP_PER_KM) +
      Math.round(run.duration * XP_PER_MIN)
    );
  }, 0);

  const streakBonus = currentStreak * STREAK_BONUS;
  return baseXP + streakBonus;
}
