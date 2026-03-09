'use client';

import { FadeInItem, FadeInStagger } from '@/components/fade-in';
import { ClubCard } from '@/components/club-card';
import { LeaderboardCard } from '@/components/leaderboard-card';
import { useInfiniteScroll } from '@/hooks/useinfiniteScroll';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/primitives/Tabs';
import {
  type ExploreListItem,
  type PaginatedApiResponse,
} from '@/types';
import { parseParams } from '@/utils';
import { Loader2, Search, SearchX } from 'lucide-react';
import Link from 'next/link';
import { useQueryStates } from 'nuqs';
import React from 'react';

interface ExplorePageClientProps {
  initialData: PaginatedApiResponse<ExploreListItem[]>;
  currentFilters: {
    query: string | null;
    page: number | null;
    type: 'clubs' | 'leaderboards' | null;
  };
}

export const ExplorePageClient: React.FC<ExplorePageClientProps> = ({
  initialData,
  currentFilters,
}) => {
  const [{ query, page, type }, setStates] = useQueryStates(
    parseParams,
    {
      shallow: false,
      throttleMs: 1000,
    }
  );

  const tab = type ?? 'all';

  const isNavigating =
    query !== currentFilters.query ||
    type !== currentFilters.type;

  const isPaging = !isNavigating && page !== currentFilters.page;

  const { items, ref, hasNextPage } = useInfiniteScroll({
    data: initialData,
    page: page ?? 1,
    setPage: (p) => setStates({ page: p }),
  });

  return (
    <div className="flex flex-col h-full">
      {/* Page Header Area */}
      <div className="mb-6 md:mb-10">
        <nav className="flex text-sm text-gray-500 dark:text-gray-400 mb-2 md:hidden">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-primary dark:text-white font-medium">
            Explore
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Explore Strive
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base mt-1">
              Discover new clubs and competitive leaderboards across the platform.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="relative mb-6">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <Search className="w-5 h-5 text-gray-400" />
        </span>
        <input
          type="text"
          value={query ?? ''}
          onChange={(e) =>
            setStates({ query: e.target.value || null, page: 1 })
          }
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark text-sm focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 shadow-sm transition-shadow"
          placeholder="Search clubs or leaderboards..."
        />
      </div>

      <Tabs
        value={tab}
        className="flex flex-col w-full min-w-0"
        onValueChange={(value) => {
          if (value === 'clubs')
            void setStates({ type: 'clubs', page: 1 });
          else if (value === 'leaderboards')
            void setStates({ type: 'leaderboards', page: 1 });
          else void setStates({ type: null, page: 1 });
        }}
      >
        <TabsList className="mb-8">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="clubs">Clubs</TabsTrigger>
          <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-6 outline-none">
          {isNavigating ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 pb-20 md:pb-0">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 h-[220px] animate-pulse"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-gray-700" />
                    <div className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 w-20 h-6" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : !isNavigating && items.length > 0 ? (
            <>
              <FadeInStagger
                key={tab}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 pb-6"
              >
                {items.map((item) => (
                  <FadeInItem key={`${item.type}-${item.id}`}>
                    {item.type === 'club' ? (
                      <ClubCard club={item} />
                    ) : (
                      <LeaderboardCard data={item} />
                    )}
                  </FadeInItem>
                ))}
              </FadeInStagger>

              {/* Intersection Observer target element */}
              {hasNextPage && (
                <div
                  ref={ref}
                  className="flex justify-center py-8 col-span-full"
                >
                  {isPaging && (
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  )}
                </div>
              )}
            </>
          ) : !isNavigating ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <SearchX className="w-10 h-10 mb-2 opacity-50 text-gray-400 dark:text-gray-500" />
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                No results found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
};
