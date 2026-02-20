'use client';

import { leaderboardValidatorSchema } from '@/backend/validators/leaderboard.validator';
import { ActivityList, type Activity } from '@/components/activity-list';
import { FadeInItem, FadeInStagger } from '@/components/fade-in';
import { LeaderboardCard } from '@/components/leaderboard-card';
import {
  LeaderboardModal,
  type LeaderboardFormValues,
} from '@/components/leaderboard-modal';
import { Button } from '@/primitives/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/primitives/Tabs';
import {
  type ApiError,
  type ApiResponse,
  type ClubListItem,
  type LeaderboardListItem,
  type PaginatedApiResponse,
} from '@/types';
import { parseParams } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios, { type AxiosError } from 'axios';
import { Plus, Search, SearchX } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQueryStates } from 'nuqs';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface LeaderboardsPageClientProps {
  initialData: PaginatedApiResponse<LeaderboardListItem[]>;
  currentFilters: {
    isActive: boolean | null;
    isPublic: boolean | null;
    query: string | null;
  };
}

export const LeaderboardsPageClient: React.FC<LeaderboardsPageClientProps> = ({
  initialData,
  currentFilters,
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [{ isActive, isPublic, query }, setStates] = useQueryStates(
    parseParams,
    {
      shallow: false,
      throttleMs: 1000,
    }
  );

  const tab = React.useMemo(() => {
    if (isActive === true) return 'active';
    if (isActive === false) return 'inactive';
    if (isPublic === true) return 'public';
    if (isPublic === false) return 'private';
    return 'all';
  }, [isActive, isPublic]);

  // Determine if we are in a loading state (navigating between tabs)
  // This happens when the URL params (isActive/isPublic from nuqs)
  // do not match the server-side props (currentFilters) yet.
  const isLoading =
    isActive !== currentFilters.isActive ||
    isPublic !== currentFilters.isPublic ||
    query !== currentFilters.query;

  // We rely on server-side data (initialData) passed via props.
  // When tabs change, the URL updates (nuqs), triggering a server re-render.
  // The isLoading state handles the visual transition until new props arrive.
  // We rely on server-side data (initialData) passed via props.
  // When tabs change or search query updates, the URL updates (nuqs), triggering a server re-render.
  // The isLoading state handles the visual transition until new props arrive.
  const leaderboards = initialData.data;

  const { data: clubs = [] } = useQuery<
    ApiResponse<ClubListItem[]>,
    Error,
    ClubListItem[]
  >({
    queryKey: ['clubs'],
    queryFn: async () => {
      const res = await axios.get('/api/clubs', {
        headers: { Authorization: `Bearer ${session?.user.token}` },
      });
      return res.data;
    },
    select: (response) => response?.data ?? [],
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<LeaderboardFormValues>({
    resolver: zodResolver(leaderboardValidatorSchema),
    defaultValues: {
      name: '',
      description: '',
      isPublic: true,
      isActive: true,
      clubId: undefined,
      expiryDate: undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: LeaderboardFormValues) => {
      const res = await axios.post('/api/leaderboards', data, {
        headers: { Authorization: `Bearer ${session?.user.token}` },
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('Leaderboard created successfully!');
      router.refresh();
      setIsModalOpen(false);
      reset();
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(
        error.response?.data?.message ?? 'Failed to create leaderboard'
      );
    },
  });

  const onSubmit = (data: LeaderboardFormValues) => {
    createMutation.mutate(data);
  };

  const recentActivities: Activity[] = [];

  return (
    <div className="flex flex-col h-full">
      {/* Page Header Area */}
      <div className="mb-6 md:mb-10 mt-16 lg:mt-0">
        <nav className="flex text-sm text-gray-500 dark:text-gray-400 mb-2 md:hidden">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span className="text-primary dark:text-white font-medium">
            Leaderboards
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              My Leaderboards
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base mt-1">
              Manage your competitions and track your progress across different
              clubs.
            </p>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto overflow-hidden relative group"
          >
            <Plus className="w-5 h-5 mr-1 group-hover:scale-110 transition-transform" />
            Create Leaderboard
          </Button>
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
          onChange={(e) => setStates({ query: e.target.value || null })}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark text-sm focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 shadow-sm transition-shadow"
          placeholder="Search your leaderboards..."
        />
      </div>

      <Tabs
        value={tab}
        className="flex flex-col w-full min-w-0"
        onValueChange={(value) => {
          if (value === 'active')
            void setStates({ isActive: true, isPublic: null });
          else if (value === 'inactive')
            void setStates({ isActive: false, isPublic: null });
          else if (value === 'public')
            void setStates({ isPublic: true, isActive: null });
          else if (value === 'private')
            void setStates({ isPublic: false, isActive: null });
          else void setStates({ isActive: null, isPublic: null });
        }}
      >
        <TabsList className="mb-8">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="public">Public</TabsTrigger>
          <TabsTrigger value="private">Private</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-6 outline-none">
          {isLoading ? (
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
          ) : !isLoading && leaderboards.length > 0 ? (
            <FadeInStagger
              key={`${tab}-${leaderboards.length}`}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 pb-20 md:pb-0"
            >
              {leaderboards.map((board) => (
                <FadeInItem key={board.id}>
                  <LeaderboardCard data={board} />
                </FadeInItem>
              ))}
            </FadeInStagger>
          ) : !isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <SearchX className="w-10 h-10 mb-2 opacity-50 text-gray-400 dark:text-gray-500" />
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                No leaderboards found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                Try adjusting your filters or search term.
              </p>
            </div>
          ) : null}
        </TabsContent>
      </Tabs>

      {/* <ActivityList activities={recentActivities} className="mt-12" /> */}

      <LeaderboardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type="create"
        register={register}
        control={control}
        errors={errors}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        isPending={createMutation.isPending}
        clubs={clubs}
        // onThumbnailChange={(file) => setThumbnail(file)}
      />
    </div>
  );
};
