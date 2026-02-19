'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/primitives/tooltip';

interface NavItemProps {
  name: string;
  href: string;
  icon: string;
  badge?: string;
}

const platformNavigation: NavItemProps[] = [
  { name: 'Dashboard', href: '/home', icon: 'dashboard' },
  { name: 'Clubs', href: '/clubs', icon: 'groups' },
  { name: 'Leaderboards', href: '/leaderboards', icon: 'emoji_events' },
  { name: 'Notifications', href: '/notifications', icon: 'notifications' },
];

const bottomNavigation: NavItemProps[] = [
  { name: 'Settings', href: '/settings', icon: 'settings' },
  { name: 'Help Center', href: '/help', icon: 'help_outline' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const NavItem = ({ item }: { item: NavItemProps }) => {
    const isActive = pathname === item.href;
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              'flex items-center px-4 py-2.5 rounded-lg group transition-colors mb-1',
              isActive
                ? 'bg-primary text-white dark:bg-white dark:text-black'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
              isCollapsed && 'justify-center px-2'
            )}
          >
            <span
              className={cn(
                'material-symbols-outlined text-[20px]',
                !isCollapsed && 'mr-3'
              )}
            >
              {item.icon}
            </span>
            {!isCollapsed && (
              <span className="text-sm font-medium">{item.name}</span>
            )}
            {!isCollapsed && item.badge && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right" className="flex items-center gap-4">
            {item.name}
          </TooltipContent>
        )}
      </Tooltip>
    );
  };

  return (
    <TooltipProvider>
      <>
        {/* --- Mobile Header (Visible only on lg and below) --- */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-card-light dark:bg-card-dark border-b border-gray-200 dark:border-gray-800 fixed w-full z-50 top-0 left-0">
          <div className="font-black text-xl tracking-tighter text-gray-900 dark:text-white flex items-center gap-1">
            STRIVE{' '}
            <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
          </div>
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>

        {/* --- Desktop Sidebar --- */}
        <aside
          className={cn(
            'hidden lg:flex flex-col bg-card-light dark:bg-card-dark border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 transition-all duration-300 z-40',
            isCollapsed ? 'w-20' : 'w-64'
          )}
        >
          {/* Logo Area */}
          <div className="h-20 flex items-center px-6 border-b border-gray-100 dark:border-gray-800">
            {!isCollapsed && (
              <span className="font-black text-2xl tracking-tighter text-gray-900 dark:text-white flex items-center gap-1">
                STRIVE
                <span className="flex space-x-1 ml-1">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                </span>
              </span>
            )}
            <button
              className={cn(
                'w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors',
                isCollapsed ? 'mx-auto' : 'ml-auto'
              )}
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isCollapsed ? 'chevron_right' : 'chevron_left'}
              </span>
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-hide">
            {!isCollapsed && (
              <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 mt-2">
                Platform
              </p>
            )}
            {platformNavigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20">
            {bottomNavigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}

            {/* User Profile Snippet */}
            <div
              className={cn(
                'mt-4 flex items-center gap-3 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-card-light dark:bg-card-dark',
                isCollapsed ? 'justify-center p-2' : ''
              )}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white font-bold text-xs shrink-0">
                J
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    Jace M.
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold">
                    Pro Member
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* --- Mobile Drawer --- */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Drawer Content */}
            <div className="absolute inset-y-0 left-0 w-72 bg-card-light dark:bg-card-dark border-r border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
              <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800">
                <span className="font-black text-2xl tracking-tighter text-gray-900 dark:text-white">
                  STRIVE
                </span>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span className="material-symbols-outlined text-gray-500">
                    close
                  </span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Platform
                </p>
                {platformNavigation.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                {bottomNavigation.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    </TooltipProvider>
  );
}
