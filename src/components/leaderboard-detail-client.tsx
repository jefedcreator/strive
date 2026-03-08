'use client';

import { leaderboardValidatorSchema } from '@/backend/validators/leaderboard.validator';
import { FadeInItem, FadeInStagger } from '@/components/fade-in';
import {
  LeaderboardModal,
  type LeaderboardFormValues,
} from '@/components/leaderboard-modal';
import { Button } from '@/primitives/Button';
import { Leaderboard } from '@/primitives/leaderboard';
import { Modal } from '@/primitives/Modal';
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

import {
  ArrowLeft,
  Trophy,
  Users,
  Calendar,
  LogOut,
  Edit2,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/primitives/dropdown-menu';

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
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

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
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(
        error.response?.data?.message ?? 'Failed to update leaderboard'
      );
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
      await queryClient.invalidateQueries({
        queryKey: ['leaderboard', leaderboard.id],
      });
      await queryClient.invalidateQueries({ queryKey: ['leaderboards'] });
      router.push('/leaderboards');
    },
  });

  const onSubmit = (data: LeaderboardFormValues) => {
    editMutation.mutate(data);
  };

  return (
    <FadeInStagger className="flex flex-col w-full min-w-0 h-full px-4 md:px-0 mt-20 lg:mt-0 pb-10">
      {/* Back link */}
      <FadeInItem>
        <Link
          href="/leaderboards"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-5 w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Leaderboards
        </Link>
      </FadeInItem>

      {/* Hero Banner */}
      <FadeInItem>
        <div className="relative w-full rounded-2xl overflow-hidden mb-3 bg-gradient-to-br from-primary/30 via-purple-500/20 to-blue-500/10 dark:from-primary/20 dark:via-purple-500/15 dark:to-blue-600/5 border border-white/20 dark:border-white/10">
          {/* Decorative blobs */}
          <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

          {/* Banner content */}
          <div className="relative flex flex-col items-center justify-center text-center px-16 py-12 md:py-16">
            <div className="w-12 h-12 rounded-2xl bg-white/20 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4 shadow-inner">
              <Trophy className="w-6 h-6 text-white drop-shadow" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white drop-shadow-sm mb-3">
              {leaderboard.name}
            </h1>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide backdrop-blur-sm ${
                  leaderboard.isPublic
                    ? 'text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-900/40'
                    : 'text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-900/40'
                }`}
              >
                {leaderboard.isPublic ? 'Public' : 'Private'}
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide backdrop-blur-sm ${
                  isCompleted
                    ? 'text-gray-600 dark:text-gray-400 bg-white/40 dark:bg-white/10'
                    : 'text-green-700 dark:text-green-300 bg-green-100/70 dark:bg-green-900/40'
                }`}
              >
                {isCompleted ? 'Ended' : 'Active'}
              </span>
            </div>
          </div>

          {/* ··· Menu */}
          <div className="absolute top-3 right-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/30 dark:bg-white/10 backdrop-blur-sm hover:bg-white/50 dark:hover:bg-white/20 transition-colors text-gray-700 dark:text-gray-200">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-card-light dark:bg-card-dark border-gray-200 dark:border-gray-800"
              >
                {isCreator && (
                  <>
                    <DropdownMenuItem
                      onClick={() => setIsEditModalOpen(true)}
                      className="flex items-center gap-2 cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-800"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Leaderboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => setIsLeaveModalOpen(true)}
                  disabled={exitMutation.isPending}
                  className="flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10"
                >
                  <LogOut className="w-4 h-4" />
                  Leave Leaderboard
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </FadeInItem>

      {/* Metadata pill row */}
      <FadeInItem>
        <div className="flex flex-wrap items-center gap-2 mb-8 px-1">
          {leaderboard.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mr-2">
              {leaderboard.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {leaderboard.club && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">
                <Users className="w-3.5 h-3.5" />
                {leaderboard.club.name}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">
              <Users className="w-3.5 h-3.5" />
              {leaderboard._count.entries}{' '}
              {leaderboard._count.entries === 1
                ? 'participant'
                : 'participants'}
            </span>
            {leaderboard.expiryDate && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">
                <Calendar className="w-3.5 h-3.5" />
                {isCompleted ? 'Ended' : 'Expires'}{' '}
                {new Date(leaderboard.expiryDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </FadeInItem>

      {/* Rankings */}
      <FadeInItem className="w-full min-w-0 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl text-gray-900 dark:text-white">
            Leaderboard Rankings
          </h2>
          <span className="text-xs font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500">
            {entries.length} {entries.length === 1 ? 'Athlete' : 'Athletes'}
          </span>
        </div>
        <Leaderboard entries={entries} currentUserId={session?.user.id} />
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
      />

      <Modal open={isLeaveModalOpen} onOpenChange={setIsLeaveModalOpen}>
        <Modal.Portal>
          <Modal.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-[400px] bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-xl z-[100] transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <LogOut className="w-5 h-5" />
                </div>
                <Modal.Title className="text-lg font-bold">
                  Leave Leaderboard
                </Modal.Title>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to leave{' '}
                <span className="font-bold text-gray-900 dark:text-white">
                  &quot;{leaderboard.name}&quot;
                </span>
                ? Your past activities will be removed from the rankings.
              </p>

              <div className="flex gap-3 justify-end mt-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsLeaveModalOpen(false)}
                  disabled={exitMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    toast.promise(exitMutation.mutateAsync(), {
                      loading: 'Leaving leaderboard…',
                      success: 'You have left the leaderboard.',
                      error: (err: AxiosError<ApiError>) =>
                        err.response?.data?.message ??
                        'Failed to leave leaderboard',
                    })
                  }
                  disabled={exitMutation.isPending}
                >
                  {exitMutation.isPending ? 'Leaving...' : 'Leave'}
                </Button>
              </div>
            </div>
          </Modal.Content>
        </Modal.Portal>
      </Modal>
    </FadeInStagger>
  );
};
