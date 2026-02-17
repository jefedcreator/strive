"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/primitives/tooltip";

interface NavItemProps {
  name: string;
  href: string;
  icon: string;
  badge?: string;
}

const platformNavigation: NavItemProps[] = [
  { name: "Dashboard", href: "/", icon: "dashboard" },
  { name: "Analytics", href: "/analytics", icon: "analytics" },
  { name: "Clubs", href: "/organization", icon: "groups" },
  { name: "Leaderboards", href: "/leaderboards", icon: "emoji_events" },
];

const managementNavigation: NavItemProps[] = [
  { name: "Projects", href: "/projects", icon: "folder_open" },
  { name: "Invoices", href: "/invoices", icon: "receipt_long" },
  { name: "Chat", href: "/chat", icon: "chat_bubble_outline", badge: "2" },
];

const bottomNavigation: NavItemProps[] = [
  { name: "Settings", href: "/settings", icon: "settings" },
  { name: "Help Center", href: "/help", icon: "help_outline" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const NavItem = ({ item }: { item: NavItemProps }) => {
    const isActive = pathname === item.href;
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              "flex items-center px-4 py-2.5 rounded-lg group transition-colors mb-1",
              isActive
                ? "bg-primary-custom text-white dark:bg-white dark:text-black"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
              isCollapsed && "justify-center px-2"
            )}
          >
            <span className={cn("material-symbols-outlined text-[20px]", !isCollapsed && "mr-3")}>
              {item.icon}
            </span>
            {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
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
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-card-light dark:bg-card-dark border-b border-border-light dark:border-border-dark fixed w-full z-50 top-0 left-0">
          <div className="font-bold text-xl tracking-tight">Strive</div>
          <button
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>

        {/* Sidebar */}
        <aside
          className={cn(
            "hidden lg:flex flex-col bg-card-light dark:bg-card-dark border-r border-border-light dark:border-border-dark h-full transition-all duration-300",
            isCollapsed ? "w-20" : "w-64"
          )}
        >
          <div className="h-16 flex items-center px-6 border-b border-border-light dark:border-border-dark">
            {!isCollapsed && (
              <span className="font-display font-bold text-2xl tracking-tighter">
                Strive
              </span>
            )}
            <span
              className={cn(
                "material-symbols-outlined text-gray-400 cursor-pointer text-sm hover:text-gray-600 dark:hover:text-gray-200 transition-colors",
                isCollapsed ? "mx-auto" : "ml-auto"
              )}
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? "chevron_right" : "chevron_left"}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 no-scrollbar">
            {!isCollapsed && (
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Platform
              </p>
            )}
            {platformNavigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}

            {!isCollapsed && (
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-8 mb-2">
                Management
              </p>
            )}
            {managementNavigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>

          <div className="p-4 border-t border-border-light dark:border-border-dark">
            {bottomNavigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>
        </aside>

        {/* Mobile Drawer (simplified implementation based on state, could be improved) */}
        {isMobileOpen && (
           <div className="fixed inset-0 z-40 lg:hidden">
             <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)} />
             <div className="fixed inset-y-0 left-0 w-64 bg-card-light dark:bg-card-dark z-50 overflow-y-auto">
               <div className="h-16 flex items-center justify-between px-6 border-b border-border-light dark:border-border-dark">
                 <span className="font-display font-bold text-2xl tracking-tighter">Strive</span>
                 <button onClick={() => setIsMobileOpen(false)}>
                   <span className="material-symbols-outlined">close</span>
                 </button>
               </div>
               <div className="py-6 px-4 space-y-1">
                 <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Platform</p>
                 {platformNavigation.map((item) => <NavItem key={item.name} item={item} />)}
                 <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-8 mb-2">Management</p>
                 {managementNavigation.map((item) => <NavItem key={item.name} item={item} />)}
                 <div className="border-t border-border-light dark:border-border-dark mt-4 pt-4">
                  {bottomNavigation.map((item) => <NavItem key={item.name} item={item} />)}
                 </div>
               </div>
             </div>
           </div>
        )}
      </>
    </TooltipProvider>
  );
}
