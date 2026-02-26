import Background from '@/components/background';
import { HomeNotifications } from '@/components/home-notifications';
import { HomeQuickActions } from '@/components/home-quick-actions';
import { LastRunCard } from '@/components/last-run-card';
import { getLeaderboards } from '@/server';
import { auth } from '@/server/auth';
import { Award } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const { user } = session;
  const username = user.fullname ?? user.name ?? 'Runner';

  // Fetch the user's latest active leaderboard participation via API
  const leaderboardsList = await getLeaderboards({ latest: true });
  const latestMembership = leaderboardsList.data[0];

  const leaderboard =
    latestMembership?.entries?.slice(0, 5).map((entry: any, index: number) => {
      const isMe = entry.userId === user.id;
      const athleteName = isMe
        ? 'You'
        : (entry.user.fullname ?? entry.user.username ?? 'Unknown Athlete');
      const initials = isMe ? 'R' : athleteName.slice(0, 2).toUpperCase();

      let color =
        'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500';
      if (index === 0)
        color =
          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      else if (index === 1)
        color = 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
      else if (index === 2)
        color =
          'bg-orange-50 dark:bg-orange-900/20 text-orange-400 dark:text-orange-300';
      else if (isMe)
        color =
          'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';

      return {
        rank: index + 1,
        athlete: athleteName,
        distance:
          entry.score > 0 ? `${(entry.score / 1000).toFixed(1)} km` : '0 km',
        avgPace: entry.runPace ? `${entry.runPace} /km` : '--',
        initials,
        color,
      };
    }) ?? [];

  const leaderboardName = latestMembership?.name ?? 'Leaderboard Overview';
  const leaderboardSubtitle = latestMembership?.club?.name
    ? `Top performers in ${latestMembership.club.name}`
    : 'Top performers from your latest competition';

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-10 relative">
      <Background />

      {/* Welcome Message */}
      <section className="mt-16 lg:mt-0 px-4 md:px-0">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {username.split(' ')[0]}
        </h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium">
          You are successfully connected. Here is your fitness overview for this
          week.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Stats & Leaderboard */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Activity Card (Client Component using Zustand) */}
          <LastRunCard type={user.type} />

          {/* Leaderboard Table */}
          <div className="bg-card-light dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden">
            <div className="p-8 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {leaderboardName}
                </h2>
                <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">
                  {leaderboardSubtitle}
                </p>
              </div>
              {latestMembership ? (
                <Link
                  href={`/leaderboards/${latestMembership.id}`}
                  className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-left sm:text-right"
                >
                  View Full Leaderboard
                </Link>
              ) : null}
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
                  {leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-4">
                          You have not joined any active leaderboards yet.
                        </p>
                        <Link
                          href="/leaderboards?isPublic=true"
                          className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                        >
                          Explore Leaderboards
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    leaderboard.map((row: any) => (
                      <tr
                        key={row.rank}
                        className={`group transition-colors ${row.athlete === 'You' ? 'bg-gray-50/50 dark:bg-white/5' : 'hover:bg-gray-50/30 dark:hover:bg-white/5'}`}
                      >
                        <td className="px-8 py-5">
                          <div
                            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${row.color}`}
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Activity & Quick Actions */}
        <div className="space-y-8">
          {/* Club Activity */}
          <HomeNotifications token={session?.user?.token ?? ''} />

          {/* Quick Actions */}
          <HomeQuickActions />

          {/* Pro Insights CTA */}
          <div className="relative overflow-hidden bg-gray-900 dark:bg-white rounded-3xl p-8 group">
            <div className="absolute top-0 right-0 p-4 opacity-10 -rotate-12 transition-transform duration-500 group-hover:scale-110 text-white dark:text-gray-900">
              <Award className="w-40 h-40" />
            </div>
            <div className="relative z-10 space-y-4">
              <h2 className="text-xl font-bold text-white dark:text-gray-900">
                Pro Insights
              </h2>
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
