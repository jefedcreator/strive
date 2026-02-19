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
import ToggleTheme from './toggle-theme';

export function TopNav() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);
  const { data: session } = useSession();
  const user = session?.user;
console.log('user',user);

  return (
    <header className="h-[70px] flex items-center justify-between px-6 lg:px-8 bg-background-light dark:bg-background-dark sticky top-0 z-30 transition-colors duration-300">
      {/* --- Breadcrumbs --- */}
      <nav className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
        <Link
          href="/"
          className="hover:text-primary dark:hover:text-primary transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          <span className="hidden sm:inline">Home</span>
        </Link>

        {pathSegments.length > 0 && (
          <span className="material-symbols-outlined text-[16px] mx-2 text-gray-400">
            chevron_right
          </span>
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
                <span className="material-symbols-outlined text-[16px] mx-2 text-gray-400">
                  chevron_right
                </span>
              )}
            </React.Fragment>
          );
        })}

        {/* Default Dashboard Breadcrumb if on root */}
        {pathSegments.length === 0 && (
          <>
            <span className="material-symbols-outlined text-[16px] mx-2 text-gray-400">
              chevron_right
            </span>
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
          <span className="material-symbols-outlined text-gray-400 text-[20px]">
            search
          </span>
          <input
            className="bg-transparent border-none text-sm focus:ring-0 text-gray-700 dark:text-gray-200 w-48 lg:w-64 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none ml-2"
            placeholder="Search activities..."
            type="text"
          />
        </div>

        {/* Notifications */}
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors relative group">
          <span className="material-symbols-outlined group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
            notifications
          </span>
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background-light dark:border-background-dark"></span>
        </button>

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
                  {user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={user.name ?? 'User'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    (
                      user?.username?.[0] ??
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
