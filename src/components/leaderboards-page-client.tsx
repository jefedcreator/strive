'use client';

import React, { useState } from 'react';
import { LeaderboardCard, Icon } from '@/components/leaderboard-card';
import { LeaderboardModal, type LeaderboardFormValues } from '@/components/leaderboard-modal';
import { FadeInStagger, FadeInItem } from '@/components/fade-in';
import { Button } from '@/primitives/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/primitives/Tabs';
import {
  leaderboardValidatorSchema,
} from '@/backend/validators/leaderboard.validator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { type ApiResponse, type PaginatedApiResponse, type LeaderboardListItem, type ClubListItem } from '@/types';
import { type User } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useQueryState, useQueryStates } from 'nuqs';
import { leaderboardSearchParams } from './leaderboards/searchparams';

const ActivityTable: React.FC<{ activities: Activity[] }> = ({ activities }) => (
    <div className="mt-12 bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-soft">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white">Recent Activity</h3>
            <Button variant="ghost" size="sm">View All</Button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3">Leaderboard</th>
                        <th className="px-6 py-3">Action</th>
                        <th className="px-6 py-3 text-right">Time</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {activities.map((activity) => (
                        <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                                    {activity.user.avatar ? (
                                        <img src={activity.user.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-xs text-gray-400">
                                            {activity.user.fullname?.[0]}
                                        </div>
                                    )}
                                </div>
                                <span className="font-medium text-gray-900 dark:text-white">{activity.user.fullname}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{activity.leaderboardTitle}</td>
                            <td className="px-6 py-4">
                                <span className="px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] font-bold uppercase">
                                    {activity.action}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right text-gray-500 dark:text-gray-400 text-xs">{activity.time}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

interface Activity {
    id: string;
    user: Partial<User>;
    leaderboardTitle: string;
    action: string;
    time: string;
}

interface LeaderboardsPageClientProps {
  initialData: PaginatedApiResponse<LeaderboardListItem[]>;
  currentFilters: {
    isActive: boolean | null;
    isPublic: boolean | null;
  };
}

export const LeaderboardsPageClient: React.FC<LeaderboardsPageClientProps> = ({ initialData, currentFilters }) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [{ isActive, isPublic }, setStates] = useQueryStates(leaderboardSearchParams, { shallow: false });

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
    (isActive !== currentFilters.isActive) || 
    (isPublic !== currentFilters.isPublic);

  const { data: leaderboardsResponse } = useQuery<PaginatedApiResponse<LeaderboardListItem[]>>({
    queryKey: ['leaderboards', isActive, isPublic],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (isActive !== null) params.isActive = String(isActive);
      if (isPublic !== null) params.isPublic = String(isPublic);
      
      const res = await axios.get('/api/leaderboards', {
        headers: { Authorization: `Bearer ${session?.user.token}` },
        params,
      });
      return res.data;
    },
    initialData: isLoading ? undefined : initialData,
    enabled: !isLoading,
    staleTime: Infinity,
  });

  // Fetch clubs for the modal dropdown
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
      await queryClient.invalidateQueries({ queryKey: ['leaderboards'] });
      setIsModalOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? 'Failed to create leaderboard'
      );
    },
  });

  const onSubmit = (data: LeaderboardFormValues) => {
    createMutation.mutate(data);
  };

  const leaderboards = leaderboardsResponse?.data ?? [];

  const recentActivities: Activity[] = [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Leaderboards
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your competitions and track your progress across different
            clubs.
          </p>
        </div>
        <div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto"
          >
            <Icon name="add" className="text-sm mr-2" />
            Create Leaderboard
          </Button>
        </div>
      </div>

      <Tabs 
        value={tab} 
        className="flex flex-col" 
        onValueChange={(value) => {
          if (value === 'active') setStates({ isActive: true, isPublic: null });
          else if (value === 'inactive') setStates({ isActive: false, isPublic: null });
          else if (value === 'public') setStates({ isPublic: true, isActive: null });
          else if (value === 'private') setStates({ isPublic: false, isActive: null });
          else if (value === 'invitations') {
             // 'invitations' clears URL params, inherently resetting to 'all' view logic for now
             // pending user decision on how to persist 'invitations' state (e.g. ?type=invitations)
             setStates({ isActive: null, isPublic: null });
          }
          else setStates({ isActive: null, isPublic: null });
        }}
      >
        <TabsList className="mb-8">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="public">Public</TabsTrigger>
          <TabsTrigger value="private">Private</TabsTrigger>
          <TabsTrigger value="invitations">
            Invitations
            <span className="ml-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-[10px] font-bold">
              2
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-6 outline-none">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 h-[220px] animate-pulse">
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
          ) : (!isLoading && leaderboards.length > 0) ? (
            <FadeInStagger key={`${tab}-${leaderboards.length}`} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 container-query">
              {leaderboards.map((board) => (
                <FadeInItem key={board.id}>
                  <LeaderboardCard data={board} />
                </FadeInItem>
              ))}
              
              <FadeInItem>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gray-50 dark:bg-white/5 rounded-2xl p-5 border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center hover:bg-white dark:hover:bg-gray-800/50 hover:border-primary dark:hover:border-gray-600 transition-all group min-h-[220px] w-full h-full"
                >
                  <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-white mb-3 transition-colors">
                    <Icon name="add" className="text-2xl" />
                  </div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1">
                    Create New Leaderboard
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px]">
                    Start a new competition with friends or your club.
                  </p>
                </button>
              </FadeInItem>
            </FadeInStagger>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Icon name="emoji_events" className="text-2xl text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                No leaderboards found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                Try adjusting your filters or create a new leaderboard.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ActivityTable activities={recentActivities} />

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
