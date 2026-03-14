'use client';

import React from 'react';
import { cn } from '@/utils';
import { getTier } from '@/backend/services/xp/logic';

interface ProfileFrameProps {
  children: React.ReactNode;
  xp?: number;
  streak?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ProfileFrame: React.FC<ProfileFrameProps> = ({
  children,
  xp = 0,
  streak = 0,
  className,
  size = 'md',
}) => {
  const tier = getTier(xp);

  // Tiers that get special frames
  const hasTierFrame = tier.name === 'Elite' || tier.name === 'Legend';
  const isLegend = tier.name === 'Legend';

  // Streaks that get special frames (Weekly streaks)
  const hasStreakFrame = streak >= 4;
  const isHighStreak = streak >= 8;

  const sizeClasses = {
    sm: 'p-[2px]',
    md: 'p-[3px]',
    lg: 'p-[4px]',
  };

  // Determine frame style
  // Legends get the ultimate crown-like glow
  // High streaks get a flame-like glow
  // Elites get a steady blue glow

  let frameGradient = '';
  let glowClass = '';
  let animationClass = '';

  if (isLegend) {
    frameGradient =
      'bg-gradient-to-tr from-yellow-300 via-amber-500 to-yellow-600';
    glowClass = 'shadow-[0_0_15px_rgba(245,158,11,0.5)]';
    animationClass = 'animate-pulse';
  } else if (isHighStreak) {
    frameGradient = 'bg-gradient-to-tr from-purple-500 via-pink-500 to-red-500';
    glowClass = 'shadow-[0_0_15px_rgba(236,72,153,0.5)]';
    animationClass = 'animate-gradient-x'; // Custom animation would need to be in tailwind config, using pulse for now
  } else if (hasStreakFrame) {
    frameGradient =
      'bg-gradient-to-tr from-orange-400 via-red-500 to-orange-600';
    glowClass = 'shadow-[0_0_10px_rgba(249,115,22,0.4)]';
  } else if (hasTierFrame) {
    frameGradient =
      'bg-gradient-to-tr from-blue-400 via-indigo-500 to-blue-600';
    glowClass = 'shadow-[0_0_10px_rgba(59,130,246,0.4)]';
  }

  if (!frameGradient) {
    return (
      <div className={cn('relative inline-flex', className)}>{children}</div>
    );
  }

  return (
    <div className={cn('relative inline-flex group', className)}>
      {/* Outer glow/animation layer */}
      <div
        className={cn(
          'absolute -inset-1 rounded-full opacity-75 blur-sm transition duration-500 group-hover:opacity-100',
          frameGradient,
          glowClass,
          animationClass
        )}
      />

      {/* The border frame */}
      <div
        className={cn(
          'relative rounded-full flex items-center justify-center bg-background-light dark:bg-background-dark overflow-hidden',
          sizeClasses[size],
          frameGradient
        )}
      >
        {/* Inner container to hold the avatar and mask the gradient to a border */}
        <div className="rounded-full bg-background-light dark:bg-background-dark p-[1px] w-full h-full flex items-center justify-center overflow-hidden">
          {children}
        </div>
      </div>

      {/* Minimalistic Streak Icon (Flame) for high streaks */}
      {hasStreakFrame && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 rounded-full border-2 border-background-light dark:border-background-dark flex items-center justify-center shadow-lg z-10 transition-transform group-hover:scale-110">
          <span className="text-[10px] select-none">🔥</span>
        </div>
      )}

      {/* Tier Icon for high tiers if no streak */}
      {!hasStreakFrame && hasTierFrame && (
        <div
          className={cn(
            'absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background-light dark:border-background-dark flex items-center justify-center shadow-lg z-10 transition-transform group-hover:scale-110',
            isLegend ? 'bg-yellow-500' : 'bg-blue-500'
          )}
        >
          <span className="text-[10px] select-none">{tier.emoji}</span>
        </div>
      )}
    </div>
  );
};
