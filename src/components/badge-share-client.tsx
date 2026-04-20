'use client';

import React from 'react';
import { cn } from '@/utils';
import Image from 'next/image';
import { toast } from 'sonner';
import { Download, Share2, ExternalLink } from 'lucide-react';
import { Button } from '@/primitives/Button';

interface BadgeShareData {
  id: string;
  type: string;
  title: string;
  description: string | null;
  earnedAt: Date;
  username: string;
  userAvatar: string | null;
  badgeUrl: string;
  milestone: number | null;
  leaderboardName: string | null;
  clubName: string | null;
}

export const BadgeShareClient: React.FC<{
  badge: BadgeShareData;
  canDownload?: boolean;
  actions?: React.ReactNode;
}> = ({ badge, canDownload = false, actions }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = badge.badgeUrl;
    link.download = `strive-${badge.title.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Badge link copied to clipboard!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${badge.username} earned "${badge.title}" on Strive`,
          text: badge.description || `Check out this badge on Strive!`,
          url: window.location.href,
          files: [
            new File([badge.badgeUrl], `${badge.title}.png`, {
              type: 'image/png',
            }),
          ],
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const typeLabels: Record<string, string> = {
    GOLD: '🥇 1st Place',
    SILVER: '🥈 2nd Place',
    BRONZE: '🥉 3rd Place',
    CLUB_MILESTONE: '🛡️ Club Milestone',
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-card-light dark:bg-card-dark rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
        {/* Badge Image */}
        <div className="relative aspect-square w-full bg-gray-950">
          <Image
            src={badge.badgeUrl}
            alt={badge.title}
            fill
            className="object-contain"
            unoptimized
            priority
          />
        </div>

        {/* Info */}
        <div className="p-6 space-y-4">
          {/* Type pill */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              {typeLabels[badge.type] ?? badge.type}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(badge.earnedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            {badge.title}
          </h1>

          {/* Description */}
          {badge.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {badge.description}
            </p>
          )}

          {/* Earned by */}
          <div className="flex items-center gap-3 pt-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden flex items-center justify-center text-sm font-bold text-gray-500 dark:text-gray-400">
              {badge.userAvatar ? (
                <Image
                  src={badge.userAvatar}
                  alt={badge.username}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                (badge.username[0]?.toUpperCase() ?? 'R')
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {badge.username}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Earned on Strive
              </p>
            </div>
          </div>

          {/* Context */}
          {/* {(badge.leaderboardName || badge.clubName) && (
            <div className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/[0.02] rounded-xl p-3 border border-gray-100 dark:border-gray-800">
              {badge.leaderboardName && (
                <p>
                  <span className="font-bold">Leaderboard:</span>{' '}
                  {badge.leaderboardName}
                </p>
              )}
              {badge.clubName && (
                <p className={badge.leaderboardName ? 'mt-1' : ''}>
                  <span className="font-bold">Club:</span> {badge.clubName}
                </p>
              )}
            </div>
          )} */}

          {/* Actions */}
          {actions ? (
            <div className="pt-2">{actions}</div>
          ) : (
            <div
              className={cn(
                'grid gap-3 pt-2',
                canDownload ? 'grid-cols-2' : 'grid-cols-1'
              )}
            >
              {canDownload && (
                <Button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={handleShare}
                className="flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                {canDownload ? 'Share' : 'Share Badge'}
              </Button>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-primary/5 flex items-center justify-between">
          <p className="text-xs font-bold text-primary/70 uppercase tracking-wider">
            Compete & earn badges
          </p>
          <a
            href="/"
            className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            Join Strive
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
