import { db } from '@/server/db';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://usestrive.run';

  // Fetch all public clubs
  const publicClubs = await db.club.findMany({
    where: { isPublic: true },
    select: { id: true, updatedAt: true },
  });

  // Fetch all public leaderboards
  const publicLeaderboards = await db.leaderboard.findMany({
    where: { isPublic: true },
    select: { id: true, updatedAt: true },
  });

  // Create Club URLs
  const clubUrls: MetadataRoute.Sitemap = publicClubs.map((club) => ({
    url: `${baseUrl}/clubs/${club.id}`,
    lastModified: club.updatedAt,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // Create Leaderboard URLs
  const leaderboardUrls: MetadataRoute.Sitemap = publicLeaderboards.map(
    (leaderboard) => ({
      url: `${baseUrl}/leaderboards/${leaderboard.id}`,
      lastModified: leaderboard.updatedAt,
      changeFrequency: 'daily',
      priority: 0.9,
    })
  );

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...clubUrls,
    ...leaderboardUrls,
  ];
}
