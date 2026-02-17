import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';
// import { StatCard } from '@/components/stat-card';
import { Leaderboard } from '@/components/leaderboard';
import { WeeklyChart } from '@/components/weekly-chart';
import { ActivityList } from '@/components/activity-list';
import Background from '@/components/background';

const StatCard = ({ label, value, unit, icon, trend }: any) => (
  <div className="bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between h-full hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
    <div className="flex justify-between items-start">
      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <span className="material-symbols-outlined text-primary text-[20px]">
          {icon}
        </span>
      </div>
      {trend && (
        <span className="text-xs font-medium text-green-500 flex items-center bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
          +{trend}%
        </span>
      )}
    </div>
    <div className="mt-4">
      <h4 className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">
        {label}
      </h4>
      <div className="flex items-baseline mt-1 gap-1">
        <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          {value}
        </span>
        <span className="text-sm text-gray-400 font-medium">{unit}</span>
      </div>
    </div>
  </div>
);

const ActivityItem = ({ icon, title, sub, date }: any) => (
  <div className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors cursor-pointer group">
    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 group-hover:border-primary/50 transition-colors">
      <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-[20px] group-hover:text-primary">
        {icon}
      </span>
    </div>
    <div className="flex-1 min-w-0">
      <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
        {title}
      </h5>
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{sub}</p>
    </div>
    <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
      {date}
    </span>
  </div>
);

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const { user } = session;
  const username = user.username ?? user.name ?? 'Runner';

  return (
    <div className="flex relative flex-col h-full lg:h-[calc(100vh-140px)] gap-6 overflow-hidden">
      {/* Header Section */}
      <Background />

      <div className="flex justify-between items-end flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Overview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome back, Jace. Youre on a 3-day streak! 🔥
          </p>
        </div>
        <div className="hidden sm:flex gap-3">
          <button className="px-4 py-2 bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Weekly View
          </button>
          <button className="px-4 py-2 bg-primary hover:bg-orange-600 text-white text-sm font-medium rounded-lg shadow-lg shadow-orange-500/20 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Log Activity
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* LEFT COLUMN (Stats & Chart) - Spans 8 cols */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
            <StatCard
              label="Distance"
              value="24.5"
              unit="km"
              icon="directions_run"
              trend="12"
            />
            <StatCard
              label="Duration"
              value="2:15"
              unit="hrs"
              icon="timer"
              trend="5"
            />
            <StatCard
              label="Calories"
              value="1,240"
              unit="kcal"
              icon="local_fire_department"
            />
            <StatCard label="Elevation" value="340" unit="m" icon="landscape" />
          </div>

          {/* Main Chart Card */}
          <div className="flex-1 min-h-[300px] bg-card-light dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Activity Volume
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span>Running</span>
                <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700 ml-2"></span>
                <span>Cycling</span>
              </div>
            </div>

            {/* Chart Placeholder / Visual */}
            <div className="flex-1 w-full bg-gray-50 dark:bg-black/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center relative">
              <div className="absolute inset-0 flex items-end justify-between px-8 pb-0 opacity-80">
                {/* Fake Bars for visual */}
                {[40, 65, 30, 85, 55, 45, 70].map((h, i) => (
                  <div
                    key={i}
                    className="w-[8%] bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-sm relative group"
                  >
                    <div
                      style={{ height: `${h}%` }}
                      className="absolute bottom-0 w-full bg-primary rounded-t-sm"
                    ></div>
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded transition-opacity">
                      {h}km
                    </div>
                  </div>
                ))}
              </div>
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between py-4 px-4 pointer-events-none">
                <div className="w-full h-px bg-gray-200 dark:bg-gray-800/50"></div>
                <div className="w-full h-px bg-gray-200 dark:bg-gray-800/50"></div>
                <div className="w-full h-px bg-gray-200 dark:bg-gray-800/50"></div>
                <div className="w-full h-px bg-gray-200 dark:bg-gray-800/50"></div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Sidebar items) - Spans 4 cols */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full min-h-0">
          {/* Recent Activity List */}
          <div className="flex-1 bg-card-light dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Recent Activities
              </h3>
              <button className="text-xs text-primary font-medium hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
              <ActivityItem
                icon="directions_run"
                title="Morning Run"
                sub="Central Park • 5k"
                date="2h ago"
              />
              <ActivityItem
                icon="pedal_bike"
                title="Afternoon Ride"
                sub="Riverside • 20k"
                date="Yesterday"
              />
              <ActivityItem
                icon="fitness_center"
                title="Strength Training"
                sub="Gym • 45m"
                date="Mon"
              />
              <ActivityItem
                icon="hiking"
                title="Weekend Hike"
                sub="Bear Mountain • 12k"
                date="Sun"
              />
            </div>
          </div>

          {/* Connected Apps Status (Replacing generic Pro box for better utility) */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 shadow-lg relative overflow-hidden flex-shrink-0 border border-gray-800">
            {/* Background decorative */}
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <span className="material-symbols-outlined text-9xl text-white">
                sync
              </span>
            </div>

            <h3 className="text-white font-bold text-lg mb-4 relative z-10 flex items-center gap-2">
              Sync Status
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            </h3>

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#FC4C02]">STRAVA</span>
                </div>
                <span className="material-symbols-outlined text-green-500 text-sm">
                  check_circle
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">NRC</span>
                </div>
                <span className="material-symbols-outlined text-green-500 text-sm">
                  check_circle
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
