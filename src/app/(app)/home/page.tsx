import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';
import Background from '@/components/background';
import { type User } from '@prisma/client';
import { getRuns } from '@/server';
import { type RunData } from '@/types';

const leaderboard = [
  {
    rank: 1,
    athlete: 'James Miller',
    distance: '84.5 km',
    avgPace: '4\'45" /km',
    initials: 'JM',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
  {
    rank: 2,
    athlete: 'Sarah Jenkins',
    distance: '72.1 km',
    avgPace: '5\'02" /km',
    initials: 'SJ',
    color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
  },
  {
    rank: 3,
    athlete: 'You',
    distance: '68.4 km',
    avgPace: '5\'10" /km',
    initials: 'R',
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  },
  {
    rank: 4,
    athlete: 'Mike K.',
    distance: '65.0 km',
    avgPace: '5\'22" /km',
    initials: 'MK',
    color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  },
  {
    rank: 5,
    athlete: 'Anna Lee',
    distance: '61.8 km',
    avgPace: '5\'15" /km',
    initials: 'AL',
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  },
];

const activities = [
  {
    id: '1',
    club: 'The Runners Club',
    description: 'Alex just finished a 10k run',
    time: '2 mins ago',
    initials: 'TR',
    color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
  },
  {
    id: '2',
    club: 'NRC Chicago',
    description: 'New challenge posted: "Winter Warrior"',
    time: '1 hour ago',
    initials: 'NRC',
    color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  },
  {
    id: '3',
    club: 'Mountain Trail',
    description: 'Sarah commented on your route.',
    time: '3 hours ago',
    initials: 'MT',
    color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
  },
];

const Icon = ({ name, className = '' }: { name: string; className?: string }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

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

  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (isToday) return `Today at ${timeStr}`;
  if (isYesterday) return `Yesterday at ${timeStr}`;
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${timeStr}`;
}

function LastRunCard({ run }: { run: RunData }) {
  return (
    <div className="bg-card-light dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden transition-transform duration-300 hover:scale-[1.005]">
      <div className="p-8 pb-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {run.name}
            </h2>
            <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm font-medium">
              <Icon name="schedule" className="text-base" />
              <span>{formatRunDate(run.date)}</span>
            </div>
          </div>
          <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1 rounded text-[10px] font-black uppercase tracking-tighter">
            {run.type}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
          <div className="space-y-1">
            <p className="text-gray-400 dark:text-gray-500 text-[11px] font-bold uppercase tracking-wider">
              Distance
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {run.distance}{' '}
              <span className="text-lg font-medium text-gray-400 dark:text-gray-500">
                km
              </span>
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-400 dark:text-gray-500 text-[11px] font-bold uppercase tracking-wider">
              Duration
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatDuration(run.duration)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-400 dark:text-gray-500 text-[11px] font-bold uppercase tracking-wider">
              Avg Pace
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{run.pace}<span className="text-lg font-medium text-gray-400 dark:text-gray-500"> /km</span></p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50/50 dark:bg-white/5 px-8 py-5 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500">
            <Icon name="check_circle" className="text-xl" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-sm">
            Latest Activity
          </span>
        </div>
        <button className="flex items-center gap-1.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          View Details <Icon name="arrow_forward" className="text-base" />
        </button>
      </div>
    </div>
  );
}

function NoRunsCard() {
  return (
    <div className="bg-card-light dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden p-8">
      <div className="flex flex-col items-center justify-center text-center gap-4 py-8">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Icon name="directions_run" className="text-3xl text-gray-400 dark:text-gray-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">No Recent Runs</h2>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">
            Connect your Strava or Nike Run Club account to see your activity here.
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const { user } = session;
  const username = (user as User).fullname ?? user.name ?? 'Runner';

  const runsResponse = await getRuns();
  const runs = runsResponse.data ?? [];
  const lastRun = runs.length > 0 ? runs[0] : null;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-10 relative">
      <Background />

      {/* Welcome Message */}
      <section>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {username.split(' ')[0]}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          You are successfully connected. Here is your fitness overview for this
          week.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Stats & Leaderboard */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Activity Card */}
          {lastRun ? <LastRunCard run={lastRun} /> : <NoRunsCard />}

          {/* Leaderboard Table */}
          <div className="bg-card-light dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden">
            <div className="p-8 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Leaderboard Overview
                </h2>
                <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">
                  Top performers in The Runners Club (This Week)
                </p>
              </div>
              <button className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-left sm:text-right">
                View Full Leaderboard
              </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 text-[11px] font-bold uppercase tracking-widest">
                      <th className="px-8 py-4">Rank</th>
                      <th className="px-8 py-4">Athlete</th>
                      <th className="px-8 py-4">Distance</th>
                      <th className="px-8 py-4 text-right">Avg Pace</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {leaderboard.map((row) => (
                      <tr
                        key={row.rank}
                        className={`group transition-colors ${row.athlete === 'You' ? 'bg-gray-50/50 dark:bg-white/5' : 'hover:bg-gray-50/30 dark:hover:bg-white/5'}`}
                      >
                        <td className="px-8 py-5">
                          <div
                            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                              row.rank === 1
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                                : row.rank === 2
                                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                                  : row.rank === 3
                                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-400 dark:text-orange-300'
                                    : 'text-gray-400 dark:text-gray-500'
                            }`}
                          >
                            {row.rank}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${row.color}`}
                            >
                              {row.initials}
                            </div>
                            <span
                              className={`text-sm font-bold ${row.athlete === 'You' ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
                            >
                              {row.athlete}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            {row.distance}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className="text-sm font-medium text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                            {row.avgPace}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>
        </div>

        {/* Right Column: Activity & Quick Actions */}
        <div className="space-y-8">
          {/* Club Activity */}
          <div className="bg-card-light dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Club Activity</h2>
              <button className="text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                View All
              </button>
            </div>

            <div className="space-y-8">
              {activities.map((act) => (
                <div key={act.id} className="flex gap-4 group">
                  <div
                    className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${act.color}`}
                  >
                    {act.initials}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors cursor-pointer">
                      {act.club}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                      {act.description}
                    </p>
                    <p className="text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">
                      {act.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card-light dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft p-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-200 group">
                <Icon
                  name="add_circle"
                  className="text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white text-2xl"
                />
                <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Manual Entry
                </span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-200 group">
                <Icon
                  name="share"
                  className="text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white text-2xl"
                />
                <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Export Data
                </span>
              </button>
            </div>
          </div>

          {/* Pro Insights CTA */}
          <div className="relative overflow-hidden bg-gray-900 dark:bg-white rounded-3xl p-8 group">
            <div className="absolute top-0 right-0 p-4 opacity-10 -rotate-12 transition-transform duration-500 group-hover:scale-110 text-white dark:text-gray-900">
              <Icon name="award" className="text-[160px]" />
            </div>
            <div className="relative z-10 space-y-4">
              <h2 className="text-xl font-bold text-white dark:text-gray-900">Pro Insights</h2>
              <p className="text-gray-400 dark:text-gray-600 text-sm font-medium leading-relaxed">
                Unlock advanced analytics and training plans with Strive Pro.
              </p>
              <button className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-bold py-3.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all transform active:scale-95">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
