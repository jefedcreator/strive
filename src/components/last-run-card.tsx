'use client';
import { useRunStore } from '@/provider/store-provider';
import type { UserType } from '@prisma/client';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';

function formatDuration(minutes: number): string {
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatRunDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) return `Today at ${timeStr}`;
  if (isYesterday) return `Yesterday at ${timeStr}`;
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${timeStr}`;
}

interface LastRunCardProps {
  type: UserType | null;
}

export function LastRunCard({ type }: LastRunCardProps) {
  const lastRun = useRunStore((state) => state.lastRun);

  if (!lastRun) {
    return (
      <div className="bg-card-light dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden p-8">
        <div className="flex flex-col items-center justify-center text-center gap-4 py-8">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Clock className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              No Recent Runs
            </h2>
            <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">
              Connect your Strava or Nike Run Club account to see your activity
              here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card-light dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden transition-transform duration-300 hover:scale-[1.005]">
      <div className="p-8 pb-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {lastRun.name}
            </h2>
            <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm font-medium">
              <Clock className="w-4 h-4" />
              <span>{formatRunDate(lastRun.date)}</span>
            </div>
          </div>
          {type && (
            <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1 rounded text-[10px] font-black uppercase tracking-tighter">
              {type}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
          <div className="space-y-1">
            <p className="text-gray-400 dark:text-gray-500 text-[11px] font-bold uppercase tracking-wider">
              Distance
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {lastRun.distance}{' '}
              <span className="text-lg font-medium text-gray-400 dark:text-gray-500">
                km
              </span>
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-400 dark:text-gray-500 text-[11px] font-bold uppercase tracking-wider">
              Duration
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatDuration(lastRun.duration)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-400 dark:text-gray-500 text-[11px] font-bold uppercase tracking-wider">
              Avg Pace
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {lastRun.pace}
              <span className="text-lg font-medium text-gray-400 dark:text-gray-500">
                {' '}
                /km
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50/50 dark:bg-white/5 px-8 py-5 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-sm">
            Latest Activity
          </span>
        </div>
        <button className="flex items-center gap-1.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          View Details <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
