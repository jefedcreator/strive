"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/primitives/dropdown-menu";
import React from "react";
// import { Button } from "@/primitives"; // Using custom buttons elements from home.html for exact match, or adapt.
import { useTheme } from "next-themes";

export function TopNav() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const { data: session } = useSession();
  const user = session?.user;
  const { setTheme, theme } = useTheme();

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-background-light dark:bg-background-dark sticky top-0 z-10">
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
        <span>Home</span>
        {pathSegments.length > 0 && <span className="mx-2">/</span>}
        {pathSegments.map((segment, index) => {
           const isLast = index === pathSegments.length - 1;
           return (
             <React.Fragment key={segment}>
               <Link 
                 href={`/${pathSegments.slice(0, index + 1).join("/")}`}
                 className={isLast ? "font-medium text-gray-900 dark:text-gray-100" : ""}
               >
                 {segment.charAt(0).toUpperCase() + segment.slice(1)}
               </Link>
               {!isLast && <span className="mx-2">/</span>}
             </React.Fragment>
           )
        })}
        {pathSegments.length === 0 && (
           <>
            <span className="mx-2">/</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Dashboard
            </span>
           </>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-full px-4 py-1.5 shadow-sm">
          <span className="material-symbols-outlined text-gray-400 text-[18px]">
            search
          </span>
          <input
            className="bg-transparent border-none text-sm focus:ring-0 text-gray-700 dark:text-gray-200 w-64 placeholder-gray-400 focus:outline-none ml-2"
            placeholder="Search activities..."
            type="text"
          />
        </div>
        
        <button className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background-light dark:border-background-dark"></span>
        </button>

        <button
          className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <span className="material-symbols-outlined hidden dark:block">
            light_mode
          </span>
          <span className="material-symbols-outlined block dark:hidden">
            dark_mode
          </span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
             <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold border border-border-light dark:border-border-dark cursor-pointer">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt={user.name ?? "User"} className="h-8 w-8 rounded-full" />
              ) : (
                (user?.username?.[0] ?? user?.name?.[0] ?? "R").toUpperCase()
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm leading-none font-medium">
                  {user?.name ?? user?.username}
                </p>
                <p className="text-muted-foreground text-xs leading-none">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

