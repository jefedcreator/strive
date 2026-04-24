type RankableEntry = {
  id: string;
  userId: string;
  score: number;
  createdAt: Date;
  runDistance: number | null;
  runPace: string | null;
};

export const isZeroPace = (pace: string | null) =>
  !pace || pace === '0' || pace === '0:00' || pace === '00:00';

export const parsePaceToSeconds = (pace: string | null) => {
  if (isZeroPace(pace)) return Infinity;
  if (!pace) return Infinity;
  const [min, sec] = pace.split(':').map(Number);
  if (min !== undefined && sec !== undefined) return min * 60 + sec;
  if (min !== undefined) return min * 60;
  return Infinity;
};

export function sortEntriesByDefaultLeaderboardOrder<T extends RankableEntry>(
  entries: T[]
) {
  const validEntries = entries.filter((entry) => !isZeroPace(entry.runPace));
  const zeroEntries = entries.filter((entry) => isZeroPace(entry.runPace));

  validEntries.sort((a, b) => {
    if ((a.runDistance ?? 0) !== (b.runDistance ?? 0)) {
      return (b.runDistance ?? 0) - (a.runDistance ?? 0);
    }

    return parsePaceToSeconds(a.runPace) - parsePaceToSeconds(b.runPace);
  });

  return [...validEntries, ...zeroEntries];
}

export function buildPositionMap<T extends RankableEntry>(entries: T[]) {
  const sortedEntries = sortEntriesByDefaultLeaderboardOrder(entries);
  const positionByEntryId = new Map<string, number>();

  sortedEntries.forEach((entry, index) => {
    positionByEntryId.set(entry.id, index + 1);
  });

  return positionByEntryId;
}

export async function recalculateLeaderboardPositions(leaderboardId: string) {
  const { db } = await import('@/server/db');

  const allEntries = await db.userLeaderboard.findMany({
    where: { leaderboardId },
    select: {
      id: true,
      userId: true,
      leaderboardId: true,
      score: true,
      createdAt: true,
      runDistance: true,
      runPace: true,
      formerPosition: true,
      currentPosition: true,
    },
  });

  const newPositions = buildPositionMap(allEntries);
  await Promise.all(
    allEntries.map((entry) => {
      const newPosition = newPositions.get(entry.id) ?? null;
      const formerPosition = entry.currentPosition ?? newPosition;
      return db.userLeaderboard.update({
        where: { id: entry.id },
        data: {
          formerPosition,
          currentPosition: newPosition,
        },
      });
    })
  );
}
