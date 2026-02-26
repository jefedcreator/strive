'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/primitives/dropdown-menu';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
// import { Button } from "@/primitives"; // Using custom buttons elements from home.html for exact match, or adapt.
import { ChevronRight, Home, Info, Search, Trophy, Users } from 'lucide-react';
import Image from 'next/image';
import ToggleTheme from './toggle-theme';

// ─── Notification type config (mirrors notification-card.tsx) ─────────────────
export const typeConfig = {
  info: {
    icon: Info,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconText: 'text-blue-600 dark:text-blue-400',
  },
  club: {
    icon: Users,
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconText: 'text-green-600 dark:text-green-400',
  },
  leaderboard: {
    icon: Trophy,
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconText: 'text-orange-600 dark:text-orange-400',
  },
} as const;

function timeAgo(date: Date | string) {
  const diffMs = Date.now() - new Date(date).getTime();
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Bell with dropdown ───────────────────────────────────────────────────────
// function NotificationBell({ token }: { token?: string }) {
//   const { data } = useQuery<PaginatedApiResponse<NotificationWithRelations[]>>({
//     queryKey: ['notifications', 'preview'],
//     queryFn: async () => {
//       const res = await axios.get<
//         PaginatedApiResponse<NotificationWithRelations[]>
//       >('/api/notifications?size=3', {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       return res.data;
//     },
//     enabled: !!token,
//     staleTime: 30_000,
//     refetchInterval: 60_000,
//   });

//   const notifications = data?.data ?? [];
//   const hasUnread = notifications.some((n) => !n.isRead);

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors relative group outline-none">
//           <Bell className="w-6 h-6 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
//           {hasUnread && (
//             <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background-light dark:border-background-dark" />
//           )}
//         </button>
//       </DropdownMenuTrigger>

//       <DropdownMenuContent
//         className="w-80 bg-card-light dark:bg-card-dark border-gray-200 dark:border-gray-800 p-0"
//         align="end"
//         sideOffset={8}
//       >
//         <DropdownMenuLabel className="flex items-center justify-between px-4 py-3 font-normal border-b border-gray-100 dark:border-gray-800">
//           <span className="text-sm font-bold text-gray-900 dark:text-white">
//             Notifications
//           </span>
//           {hasUnread && (
//             <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 uppercase tracking-wide">
//               New
//             </span>
//           )}
//         </DropdownMenuLabel>

//         {notifications.length === 0 ? (
//           <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400 dark:text-gray-500">
//             <Bell className="w-6 h-6 mb-2 opacity-40" />
//             <p className="text-xs">No notifications yet</p>
//           </div>
//         ) : (
//           notifications.map((n) => {
//             const cfg = typeConfig[n.type] ?? typeConfig.info;
//             const Icon = cfg.icon;
//             return (
//               <DropdownMenuItem
//                 key={n.id}
//                 asChild
//                 className={`flex items-start gap-3 px-4 py-3 cursor-pointer focus:bg-gray-50 dark:focus:bg-white/5 ${n.isRead ? 'opacity-60' : ''}`}
//               >
//                 <Link href="/notifications">
//                   <div
//                     className={`shrink-0 w-8 h-8 rounded-full ${cfg.iconBg} ${cfg.iconText} flex items-center justify-center mt-0.5`}
//                   >
//                     <Icon className="w-4 h-4" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-start justify-between gap-2">
//                       <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2 leading-snug">
//                         {n.message}
//                       </p>
//                       {!n.isRead && (
//                         <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-1" />
//                       )}
//                     </div>
//                     <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
//                       {timeAgo(n.createdAt)}
//                     </p>
//                   </div>
//                 </Link>
//               </DropdownMenuItem>
//             );
//           })
//         )}

//         <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
//         <DropdownMenuItem
//           asChild
//           className="flex items-center justify-center cursor-pointer py-3 text-xs font-semibold text-primary focus:text-primary focus:bg-gray-50 dark:focus:bg-white/5"
//         >
//           <Link href="/notifications">View all notifications</Link>
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }

export function TopNav() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);
  const { data: session } = useSession();
  const user = session?.user;
  console.log('user', user);

  return (
    <header className="hidden lg:flex h-[70px] items-center justify-between px-6 lg:px-8 bg-background-light dark:bg-background-dark sticky top-0 z-30 transition-colors duration-300">
      {/* --- Breadcrumbs --- */}
      <nav className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
        <Link
          href="/"
          className="hover:text-primary dark:hover:text-primary transition-colors flex items-center gap-1"
        >
          <Home className="w-[18px] h-[18px]" />
          <span className="hidden sm:inline">Home</span>
        </Link>

        {pathSegments.length > 0 && (
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
        )}

        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;
          const href = `/${pathSegments.slice(0, index + 1).join('/')}`;

          return (
            <React.Fragment key={segment}>
              <Link
                href={href}
                className={`capitalize hover:text-gray-900 dark:hover:text-white transition-colors ${
                  isLast
                    ? 'text-gray-900 dark:text-white font-bold pointer-events-none'
                    : ''
                }`}
              >
                {segment}
              </Link>
              {!isLast && (
                <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
              )}
            </React.Fragment>
          );
        })}

        {/* Default Dashboard Breadcrumb if on root */}
        {pathSegments.length === 0 && (
          <>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-bold">
              Dashboard
            </span>
          </>
        )}
      </nav>

      {/* --- Right Actions --- */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search Bar (Hidden on mobile) */}
        <div className="hidden md:flex items-center bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            className="bg-transparent border-none text-sm focus:ring-0 text-gray-700 dark:text-gray-200 w-48 lg:w-64 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none ml-2"
            placeholder="Search activities..."
            type="text"
          />
        </div>

        {/* Notifications */}
        {/* <NotificationBell token={session?.user?.token ?? undefined} /> */}

        {/* Theme Toggle */}
        {/* <button
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors group"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <span className="material-symbols-outlined hidden dark:block group-hover:text-yellow-400 transition-colors">
            light_mode
          </span>
          <span className="material-symbols-outlined block dark:hidden group-hover:text-purple-600 transition-colors">
            dark_mode
          </span>
        </button> */}
        <ToggleTheme />

        {/* User Menu */}
        <div className="pl-2 border-l border-gray-200 dark:border-gray-800">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:opacity-80 transition-opacity outline-none">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-xs font-bold text-white shadow-md border-2 border-background-light dark:border-background-dark">
                  {user?.image?.startsWith('http') ? (
                    <Image
                      src={user.image}
                      alt={user.name ?? 'User'}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (
                      user?.fullname?.[0] ??
                      user?.name?.[0] ??
                      'U'
                    ).toUpperCase()
                  )}
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-card-light dark:bg-card-dark border-gray-200 dark:border-gray-800"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                    {user?.name ?? user?.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-none">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
              <DropdownMenuItem
                asChild
                className="focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer"
              >
                <Link href="/settings">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer"
              >
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10 cursor-pointer"
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
