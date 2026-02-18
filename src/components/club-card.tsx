import React from 'react';
import Link from 'next/link';
import { type ClubListItem } from '@/types';
import { StatusBadge, PrivacyBadge } from '@/primitives/badge';

interface ClubCardProps {
  club: ClubListItem;
}

export const ClubCard: React.FC<ClubCardProps> = ({ club }) => {
  const isInactive = !club.isActive;

  return (
    <div
      className={`bg-card-light dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-soft transition-all hover:shadow-md ${isInactive ? 'opacity-75' : ''}`}
    >
      <div className="flex items-start gap-4">
        {club.image ? (
          <img
            alt={club.name}
            className={`w-16 h-16 rounded-lg object-cover bg-gray-100 dark:bg-gray-800 flex-shrink-0 ${isInactive ? 'grayscale' : ''}`}
            src={club.image}
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-gray-400">groups</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
              {club.name}
            </h3>
            <div className="flex gap-1">
              <StatusBadge status={club.isActive} />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {club.slug}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
            {club.description}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <PrivacyBadge privacy={club.isPublic} />
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">group</span>{' '}
            {club.members.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button className="text-sm text-red-600 dark:text-red-400 font-medium hover:text-red-700 transition-colors">
            {isInactive ? 'Delete' : 'Leave'}
          </button>
          <Link
            href={`/clubs/${club.id}`}
            className="text-sm font-medium text-primary dark:text-white flex items-center hover:underline group"
          >
            View Details
            <span className="material-symbols-outlined text-sm ml-0.5 transform group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

