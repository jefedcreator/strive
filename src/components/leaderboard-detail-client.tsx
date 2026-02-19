'use client';

import { leaderboardValidatorSchema } from '@/backend/validators/leaderboard.validator';
import { FadeInItem, FadeInStagger } from '@/components/fade-in';
import {
  LeaderboardModal,
  type LeaderboardFormValues,
} from '@/components/leaderboard-modal';
import {
  type ApiError,
  type ApiResponse,
  type ClubListItem,
  type LeaderboardDetail,
} from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios, { type AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Image from 'next/image';

import { ArrowLeft, Trophy, Users, Calendar, LogOut, Edit2, ListOrdered } from 'lucide-react';

interface LeaderboardDetailClientProps {
  initialData: ApiResponse<LeaderboardDetail | null>;
}

export const LeaderboardDetailClient: React.FC<
  LeaderboardDetailClientProps
> = ({ initialData }) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const currentUserId = session?.user?.id;
  const isCreator = currentUserId
    ? initialData.data?.createdById === currentUserId
    : false;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // const [thumbnail, setThumbnail] = useState<File | null>(null);

  const { data: response } = useQuery<ApiResponse<LeaderboardDetail | null>>({
    queryKey: ['leaderboard', initialData.data?.id],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<LeaderboardDetail>>(
        `/api/leaderboards/${initialData.data!.id}`,
        { headers: { Authorization: `Bearer ${session?.user.token}` } }
      );
      return data;
    },
    initialData,
    staleTime: Infinity,
  });

  const leaderboard = response.data!;

  const entries = leaderboard.entries ?? [];
  const isCompleted = leaderboard.expiryDate
    ? new Date(leaderboard.expiryDate) < new Date()
    : false;

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
  } = useForm<LeaderboardFormValues>({
    resolver: zodResolver(leaderboardValidatorSchema),
    defaultValues: {
      name: leaderboard.name,
      description: leaderboard.description ?? '',
      isPublic: leaderboard.isPublic,
      isActive: leaderboard.isActive,
      expiryDate: leaderboard.expiryDate
        ? new Date(leaderboard.expiryDate)
        : undefined,
      clubId: leaderboard.clubId ?? undefined,
    },
  });

  const editMutation = useMutation({
    mutationFn: async (data: LeaderboardFormValues) => {
      const res = await axios.put(`/api/leaderboards/${leaderboard.id}`, data, {
        headers: { Authorization: `Bearer ${session?.user.token}` },
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('Leaderboard updated successfully!');
      await queryClient.invalidateQueries({
        queryKey: ['leaderboard', leaderboard.id],
      });
      await queryClient.invalidateQueries({ queryKey: ['leaderboards'] });
      setIsEditModalOpen(false);
      // setThumbnail(null);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? 'Failed to update leaderboard');
    },
  });

  const exitMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.delete(
        `/api/leaderboards/${leaderboard.id}/exit`,
        {
          headers: { Authorization: `Bearer ${session?.user.token}` },
        }
      );
      return res.data;
    },
    onSuccess: async () => {
      toast.success('You have left the leaderboard.');
      await queryClient.invalidateQueries({
        queryKey: ['leaderboard', leaderboard.id],
      });
      await queryClient.invalidateQueries({ queryKey: ['leaderboards'] });
      router.push('/leaderboards');
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? 'Failed to leave leaderboard');
    },
  });

  const onSubmit = (data: LeaderboardFormValues) => {
    editMutation.mutate(data);
  };

  return (
    <FadeInStagger className="flex flex-col h-full">
      {/* Back link */}
      <FadeInItem>
        <Link
          href="/leaderboards"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6 w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Leaderboards
        </Link>
      </FadeInItem>

      {/* Header */}
      <FadeInItem>
        <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 shadow-soft p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary/10 dark:bg-white/10 flex items-center justify-center text-primary dark:text-white shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {leaderboard.name}
                  </h1>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                      leaderboard.isPublic
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                    }`}
                  >
                    {leaderboard.isPublic ? 'Public' : 'Private'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                      isCompleted
                        ? 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
                        : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                    }`}
                  >
                    {isCompleted ? 'Ended' : 'Active'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl">
                  {leaderboard.description ?? 'No description provided.'}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                  {leaderboard.club && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{leaderboard.club.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>
                      {leaderboard._count.entries}{' '}
                      {leaderboard._count.entries === 1
                        ? 'participant'
                        : 'participants'}
                    </span>
                  </div>
                  {leaderboard.expiryDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {isCompleted ? 'Ended' : 'Expires'}{' '}
                        {new Date(leaderboard.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* {!isCreator && ( */}
              <button
                onClick={() => exitMutation.mutate()}
                disabled={exitMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 dark:border-red-800/50 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {exitMutation.isPending ? 'Leaving...' : 'Leave'}
              </button>
              {/* )} */}
              {isCreator && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </FadeInItem>

      {/* Entries Table */}
      <FadeInItem>
        <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 shadow-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white">
              Rankings
            </h2>
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <ListOrdered className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                No entries yet
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                This leaderboard doesn&apos;t have any participants yet. Share
                it to get started!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-3 w-16">Rank</th>
                    <th className="px-6 py-3">Athlete</th>
                    <th className="px-6 py-3 text-right">Score</th>
                    <th className="px-6 py-3 text-right">Last Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {entries.map((entry, index) => {
                    const rank = index + 1;
                    return (
                      <tr
                        key={entry.id}
                        className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div
                            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                              rank === 1
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                                : rank === 2
                                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                                  : rank === 3
                                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-400 dark:text-orange-300'
                                    : 'text-gray-400 dark:text-gray-500'
                            }`}
                          >
                            {rank}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden shrink-0 relative">
                              {entry.user.avatar ? (
                                <Image
                                  src={entry.user.avatar}
                                  alt={entry.user.fullname ?? entry.user.username ?? 'User avatar'}
                                  width={32}
                                  height={32}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-xs text-gray-400 dark:text-gray-500">
                                  {entry.user.fullname?.[0]?.toUpperCase() ??
                                    '?'}
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {entry.user.fullname ??
                                  entry.user.username ??
                                  'Unknown'}
                              </span>
                              {entry.user.username && entry.user.fullname && (
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                  @{entry.user.username}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-gray-900 dark:text-white tabular-nums">
                            {entry.score.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-500 dark:text-gray-400 text-xs">
                          {entry.lastScoreDate
                            ? new Date(entry.lastScoreDate).toLocaleDateString()
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </FadeInItem>

      <LeaderboardModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        type="edit"
        register={register}
        control={control}
        errors={errors}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        isPending={editMutation.isPending}
        clubs={clubs}
        // onThumbnailChange={(file) => setThumbnail(file)}
      />
    </FadeInStagger>
  );
};
