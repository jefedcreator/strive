import React from 'react';
import { type LeaderboardListItem } from '@/types';

export interface LeaderboardCardProps {
  data: LeaderboardListItem;
}

export const Icon: React.FC<{ name: string; className?: string }> = ({ name, className = '' }) => {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
};

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ data }) => {
  const isCompleted = data.expiryDate ? new Date(data.expiryDate) < new Date() : false;
  const participantsCount = data._count?.entries ?? 0;

  return (
    <div
      className={`bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all group ${!data.isActive || isCompleted ? 'opacity-75 hover:opacity-100' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`h-12 w-12 rounded-xl bg-primary/10 dark:bg-white/10 flex items-center justify-center text-primary dark:text-white`}
          >
            <Icon name="emoji_events" />
          </div>
          <div>
            <span
              className={`text-[10px] font-bold ${data.isPublic ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'} px-2 py-0.5 rounded-full uppercase tracking-wide`}
            >
              {data.isPublic ? 'Public' : 'Private'}
            </span>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mt-0.5 truncate max-w-[180px]">
              {data.name}
            </h3>
          </div>
        </div>
        <div className="relative">
          <button className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <Icon name="more_vert" className="text-lg" />
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 min-h-[40px]">
        {data.description || 'No description provided.'}
      </p>

      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-5 space-x-4">
        <div className="flex items-center">
          <Icon name="groups" className="text-base mr-1" />
          {data.club?.name || 'General'}
        </div>
        <div className="flex items-center">
          <Icon
            name={isCompleted ? 'event' : 'schedule'}
            className="text-base mr-1"
          />
          {isCompleted ? 'Ended' : 'Active'}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="people" className="text-base text-gray-400" />
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {participantsCount} {participantsCount === 1 ? 'participant' : 'participants'}
          </span>
        </div>

        <a
          href={`/leaderboards/${data.id}`}
          className="text-sm font-semibold text-gray-900 dark:text-white flex items-center hover:underline"
        >
          {isCompleted ? 'Results' : 'View Board'}{' '}
          <Icon name="arrow_forward" className="text-sm ml-1" />
        </a>
      </div>
    </div>
  );
};
