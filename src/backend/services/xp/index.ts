import { db } from '@/server/db';
import { type RunData } from '@/types';
import { checkStreakRewards } from '@/backend/services/rewards';
import { getTier, calculateRunXP } from './logic';

export * from './logic';

// ─── Streak Logic ──────────────────────────────────────────────────────────────

/**
 * Check if two dates are in the same ISO week.
 */
function sameWeek(a: Date, b: Date): boolean {
  const getWeekStart = (d: Date) => {
    const dt = new Date(d);
    const day = dt.getDay();
    const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
    dt.setDate(diff);
    dt.setHours(0, 0, 0, 0);
    return dt.getTime();
  };
  return getWeekStart(a) === getWeekStart(b);
}

/**
 * Check if date `a` is in the week immediately before date `b`.
 */
function isConsecutiveWeek(a: Date, b: Date): boolean {
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const aStart = new Date(a);
  const aDay = aStart.getDay();
  aStart.setDate(aStart.getDate() - aDay + (aDay === 0 ? -6 : 1));
  aStart.setHours(0, 0, 0, 0);

  const bStart = new Date(b);
  const bDay = bStart.getDay();
  bStart.setDate(bStart.getDate() - bDay + (bDay === 0 ? -6 : 1));
  bStart.setHours(0, 0, 0, 0);

  return Math.abs(bStart.getTime() - aStart.getTime()) === weekMs;
}

// ─── Main Sync Function ────────────────────────────────────────────────────────

/**
 * Sync a user's XP based on their latest runs.
 * Called after the runs API fetches and scores are updated.
 */
export async function syncUserXP(userId: string, runs: RunData[]) {
  if (runs.length === 0) return;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      xp: true,
      currentStreak: true,
      longestStreak: true,
      lastRunDate: true,
    },
  });

  if (!user) return;

  const latestRunDate = runs.reduce(
    (latest, r) => (r.date > latest ? r.date : latest),
    runs[0]!.date
  );
  const latestDate = new Date(latestRunDate);
  const now = new Date();

  // Calculate streak
  let newStreak = user.currentStreak;

  if (user.lastRunDate) {
    const lastDate = new Date(user.lastRunDate);
    if (sameWeek(lastDate, now)) {
      // Same week — streak continues, no change
    } else if (isConsecutiveWeek(lastDate, now)) {
      // Consecutive week — increment streak
      newStreak += 1;
    } else {
      // Streak broken — reset to 1 (current week counts)
      newStreak = 1;
    }
  } else {
    // First ever run
    newStreak = 1;
  }

  const newLongest = Math.max(user.longestStreak, newStreak);

  // Calculate XP from this batch
  const earnedXP = calculateRunXP(runs, newStreak);
  const newXP = user.xp + earnedXP;

  await db.user.update({
    where: { id: userId },
    data: {
      xp: newXP,
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastRunDate: latestDate,
    },
  });

  // Check if streak rewards should be awarded
  checkStreakRewards(userId).catch(console.error);

  return { xp: newXP, streak: newStreak, tier: getTier(newXP) };
}
