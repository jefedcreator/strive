import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { StatCard } from "./_components/stat-card";
import { Leaderboard } from "./_components/leaderboard";
import { WeeklyChart } from "./_components/weekly-chart";
import { ActivityList } from "./_components/activity-list";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const { user } = session;
  const username = user.username ?? user.name ?? "Runner";

  return (
    <div className="space-y-6">
      <div className="mt-8 mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Welcome back, {username}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          You are successfully connected. Here&apos;s your fitness overview for this week.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Morning Run Card */}
          <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Morning Run
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                  <span className="material-symbols-outlined text-[16px] mr-1">
                    place
                  </span>
                  Central Park Loop • Today at 7:00 AM
                </p>
              </div>
              <span className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-3 py-1 rounded-full">
                STRAVA
              </span>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4">
                <StatCard label="Distance" value="5.2" unit="km" />
                <StatCard label="Duration" value="28:45" />
                <StatCard label="Avg Pace" value="5'31&quot;" />
                <StatCard label="Calories" value="420" />
              </div>
              <div className="mt-8 pt-6 border-t border-border-light dark:border-border-dark flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="material-symbols-outlined text-orange-500">
                    local_fire_department
                  </span>
                  <span className="text-sm font-medium">New 5k Record!</span>
                </div>
                <button className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium flex items-center transition-colors">
                  View Details
                  <span className="material-symbols-outlined text-[16px] ml-1">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </div>

          <Leaderboard />
          <WeeklyChart />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <ActivityList />

          {/* Quick Actions */}
          <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 rounded-lg border border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">
                  add_circle_outline
                </span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Manual Entry
                </span>
              </button>
              <button className="p-3 rounded-lg border border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">
                  ios_share
                </span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Export Data
                </span>
              </button>
            </div>
          </div>

          {/* Pro Insights */}
          <div className="bg-gradient-to-br from-gray-800 to-black text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-9xl">
                emoji_events
              </span>
            </div>
            <h3 className="font-bold text-lg mb-2 relative z-10">
              Pro Insights
            </h3>
            <p className="text-sm text-gray-300 mb-4 relative z-10">
              Unlock advanced analytics and training plans with Strive Pro.
            </p>
            <button className="w-full py-2 bg-white text-black font-semibold rounded-lg text-sm hover:bg-gray-100 transition-colors relative z-10">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
