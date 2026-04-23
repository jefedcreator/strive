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
import api from '@/utils/axios';
import { type AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Trophy,
  Users,
  Calendar,
  LogOut,
  LogIn,
  Edit2,
  MoreHorizontal,
  Share2,
  Download,
  X,
  Filter,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/primitives/dropdown-menu';
import Image from 'next/image';

interface LeaderboardDetailClientProps {
  initialData: ApiResponse<LeaderboardDetail | null>;
}

export const LeaderboardDetailClient: React.FC<
  LeaderboardDetailClientProps
> = ({ initialData }) => {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sortByState, setSortByState] = useQueryState('sortBy', {
    defaultValue: 'score',
    shallow: false,
    history: 'replace',
    clearOnDefault: true,
  });

  const currentUserId = session?.user?.id;
  const isCreator = currentUserId
    ? initialData.data?.createdById === currentUserId
    : false;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const sortBy = sortByState || 'score';

  const handleSortChange = (newSortBy: string) => {
    startTransition(async () => {
      await setSortByState(newSortBy === 'score' ? null : newSortBy);
    });
  };

  const leaderboard = initialData.data!;
  const entries = leaderboard.entries ?? [];
  const isCompleted = leaderboard.expiryDate
    ? new Date(leaderboard.expiryDate) < new Date()
    : false;
  const isMember = currentUserId
    ? entries.some((e) => e.userId === currentUserId)
    : false;
  const isInactive = !leaderboard.isActive;
  const isChallenge = !leaderboard.clubId;
  const userEntry = currentUserId
    ? entries.find((e) => e.userId === currentUserId)
    : null;
  const userRank = currentUserId
    ? entries.findIndex((e) => e.userId === currentUserId) + 1
    : null;

  // Fetch clubs for the modal dropdown
  const { data: clubs = [] } = useQuery<
    ApiResponse<ClubListItem[]>,
    Error,
    ClubListItem[]
  >({
    queryKey: ['clubs'],
    queryFn: async () => {
      const res = await api.get('/clubs', {
        headers: { Authorization: `Bearer ${session?.user.token}` },
      });
      return res.data;
    },
    select: (response) => response?.data ?? [],
    enabled: !!session?.user?.id && isCreator,
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
      type: leaderboard.type ?? 'COMBINED',
    },
  });

  const editMutation = useMutation({
    mutationFn: async (data: LeaderboardFormValues) => {
      const res = await api.put(`/leaderboards/${leaderboard.id}`, data, {
        headers: { Authorization: `Bearer ${session?.user.token}` },
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('Leaderboard updated successfully!');
      await queryClient.invalidateQueries({ queryKey: ['leaderboards'] });
      router.refresh();
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
      const res = await api.delete(`/leaderboards/${leaderboard.id}/exit`, {
        headers: { Authorization: `Bearer ${session?.user.token}` },
      });
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['leaderboards'] });
      router.refresh();
      router.push('/leaderboards');
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(
        error.response?.data?.message ?? 'Failed to exit leaderboard'
      );
    },
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(
        `/leaderboards/${leaderboard.id}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${session?.user.token}` },
        }
      );
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['leaderboards'] });
      router.refresh();
    },
  });

  const onSubmit = (data: LeaderboardFormValues) => {
    editMutation.mutate(data);
  };

  return (
    <FadeInStagger className="flex flex-col w-full min-w-0 h-full px-0 mt-20 lg:mt-0 pb-10">
      {/* Back link */}
      <FadeInItem>
        <Link
          href="/leaderboards"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-5 w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {isChallenge ? 'Challenges' : 'Leaderboards'}
        </Link>
      </FadeInItem>

      {/* Hero Banner */}
      <FadeInItem>
        <div className="relative w-full rounded-2xl overflow-hidden mb-3 border border-gray-200 dark:border-gray-800">
          <>
            <Image
              src={`/api/leaderboards/${leaderboard.id}/image?name=${encodeURIComponent(leaderboard.name)}&type=${isChallenge ? 'challenge' : 'leaderboard'}`}
              alt={leaderboard.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
          </>
          {/* Banner content */}
          <div className="relative flex flex-col items-center justify-center text-center px-16 py-12 md:py-16">
            <div className="w-12 h-12 rounded-2xl bg-white/20 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4 shadow-inner">
              <Trophy className="w-6 h-6 text-white drop-shadow" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-sm mb-3">
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
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {!isMember && !isInactive && !isCompleted && (
              <Button
                size="sm"
                variant="outline"
                disabled={joinMutation.isPending || isInactive || isCompleted}
                onClick={() => {
                  if (status !== 'authenticated') {
                    router.push(`/login?leaderboardId=${leaderboard.id}`);
                    return;
                  }
                  toast.promise(joinMutation.mutateAsync(), {
                    loading: 'Joining leaderboard…',
                    success: 'Successfully joined the leaderboard!',
                    error: (err: AxiosError<ApiError>) =>
                      err.response?.data?.message ??
                      'Failed to join leaderboard',
                  });
                }}
                className="bg-black/20 hover:bg-black/40 text-white border-white/20 backdrop-blur-md shadow-sm transition-all"
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                {joinMutation.isPending
                  ? 'Joining...'
                  : `Join ${isChallenge ? 'Challenge' : 'Leaderboard'}`}
              </Button>
            )}

            {isMember && (
              <Button
                size="sm"
                variant="outline"
                disabled={exitMutation.isPending}
                onClick={() => setIsLeaveModalOpen(true)}
                className="bg-black/20 hover:bg-black/40 text-white border-white/20 backdrop-blur-md shadow-sm transition-all"
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                Leave
              </Button>
            )}

            {(isCreator || (isCompleted && isMember)) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 dark:bg-black/40 border border-white/20 backdrop-blur-md dark:hover:bg-black/60 transition-colors text-white shadow-sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 shadow-xl"
                >
                  {isCreator && (
                    <>
                      <DropdownMenuItem
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-2 cursor-pointer focus:bg-gray-100 dark:focus:bg-[#2A2A2E]"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit {isChallenge ? 'Challenge' : 'Leaderboard'}
                      </DropdownMenuItem>
                      {isCompleted && isMember && (
                        <DropdownMenuSeparator className="bg-gray-100 dark:bg-[#2A2A2E]" />
                      )}
                    </>
                  )}

                  {isCompleted && isMember && (
                    <DropdownMenuItem
                      onClick={() => setIsShareModalOpen(true)}
                      className="flex items-center gap-2 cursor-pointer focus:bg-gray-100 dark:focus:bg-[#2A2A2E] text-primary font-bold"
                    >
                      <Share2 className="w-4 h-4" />
                      Share My Moment
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${
                leaderboard.type === 'PACE'
                  ? 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30'
                  : leaderboard.type === 'COMBINED'
                    ? 'text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/30'
                    : 'text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/30'
              }`}
            >
              {leaderboard.type === 'PACE'
                ? 'Pace'
                : leaderboard.type === 'COMBINED'
                  ? 'Combined'
                  : 'Distance'}
            </span>
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
          <h2 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-3">
            {isChallenge ? 'Challenge' : 'Leaderboard'} Rankings
            {isPending && (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            )}
          </h2>

          <div className="flex items-center gap-4">
            <span className="text-xs font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500 hidden sm:inline-block">
              {entries.length} {entries.length === 1 ? 'Athlete' : 'Athletes'}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-2 text-xs font-medium bg-card-light dark:bg-card-dark cursor-pointer text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-800"
                >
                  <Filter className="w-3.5 h-3.5" />
                  Sort:{' '}
                  {sortBy === 'score'
                    ? 'Default'
                    : sortBy === 'distance'
                      ? 'Distance'
                      : 'Pace'}
                  <ChevronDown className="w-3 h-3 ml-1 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-44 bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 shadow-xl"
              >
                <DropdownMenuItem
                  onClick={() => handleSortChange('score')}
                  className={`text-xs cursor-pointer ${sortBy === 'score' ? 'font-bold' : ''} focus:bg-gray-100 dark:focus:bg-[#2A2A2E]`}
                >
                  Default
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSortChange('distance')}
                  className={`text-xs cursor-pointer ${sortBy === 'distance' ? 'font-bold' : ''} focus:bg-gray-100 dark:focus:bg-[#2A2A2E]`}
                >
                  Distance
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSortChange('pace')}
                  className={`text-xs cursor-pointer ${sortBy === 'pace' ? 'font-bold' : ''} focus:bg-gray-100 dark:focus:bg-[#2A2A2E]`}
                >
                  Pace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Leaderboard
          entries={entries}
          currentUserId={session?.user.id}
          leaderboardType={leaderboard.type}
          disableInternalSort
          movementTooltipMode={sortBy === 'score' ? 'historical' : 'relative'}
        />
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

      <Modal open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <Modal.Portal>
          <Modal.Content className="fixed top-1/2 left-1/2 w-[95vw] max-w-[600px] bg-card-light dark:bg-card-dark rounded-2xl p-0 border border-gray-200 dark:border-gray-800 shadow-2xl z-[100] transform -translate-x-1/2 -translate-y-1/2 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 flex items-center justify-between">
              <div>
                <Modal.Title className="text-xl font-bold text-gray-900 dark:text-white">
                  Share Your Moment
                </Modal.Title>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Great work! Download and share your achievements with the
                  world.
                </p>
              </div>
              <Modal.Close className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X className="w-5 h-5" />
              </Modal.Close>
            </div>

            <div className="p-8 flex flex-col items-center gap-8">
              <div className="relative aspect-square w-full max-w-[400px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-black/5">
                <Image
                  src={`/api/share-card?leaderboardId=${leaderboard.id}&userId=${currentUserId}&name=${encodeURIComponent(session?.user?.fullname || '')}&score=${userEntry?.score || 0}&rank=${userRank || 0}&distance=${userEntry?.runDistance || 0}&pace=${encodeURIComponent(userEntry?.runPace || '0:00')}&duration=${userEntry?.runDuration || 0}&avatar=${encodeURIComponent(session?.user?.image || '')}&leaderboardName=${encodeURIComponent(leaderboard.name)}`}
                  alt="Share Card"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-[400px]">
                <Button
                  onClick={() => {
                    const url = `/api/share-card?leaderboardId=${leaderboard.id}&userId=${currentUserId}&name=${encodeURIComponent(session?.user?.fullname || '')}&score=${userEntry?.score || 0}&rank=${userRank || 0}&distance=${userEntry?.runDistance || 0}&pace=${encodeURIComponent(userEntry?.runPace || '0:00')}&duration=${userEntry?.runDuration || 0}&avatar=${encodeURIComponent(session?.user?.image || '')}&leaderboardName=${encodeURIComponent(leaderboard.name)}`;
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `strive-achievement-${leaderboard.name.toLowerCase().replace(/\s+/g, '-')}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex items-center justify-center gap-2 py-6 text-base"
                >
                  <Download className="w-5 h-5" />
                  Download
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const url = `${window.location.origin}/api/share-card?leaderboardId=${leaderboard.id}&userId=${currentUserId}&name=${encodeURIComponent(session?.user?.fullname || '')}&score=${userEntry?.score || 0}&rank=${userRank || 0}&distance=${userEntry?.runDistance || 0}&pace=${encodeURIComponent(userEntry?.runPace || '0:00')}&duration=${userEntry?.runDuration || 0}&avatar=${encodeURIComponent(session?.user?.image || '')}&leaderboardName=${encodeURIComponent(leaderboard.name)}`;
                    navigator.clipboard.writeText(url);
                    toast.success('Link copied to clipboard!');
                  }}
                  className="flex items-center justify-center gap-2 py-6 text-base"
                >
                  <Share2 className="w-5 h-5" />
                  Copy Link
                </Button>
              </div>
            </div>

            <div className="p-4 bg-primary/5 border-t border-primary/10 text-center">
              <p className="text-[10px] uppercase font-bold tracking-widest text-primary/70">
                Tag @strive on Instagram/X to get featured
              </p>
            </div>
          </Modal.Content>
        </Modal.Portal>
      </Modal>

      <Modal open={isLeaveModalOpen} onOpenChange={setIsLeaveModalOpen}>
        <Modal.Portal>
          <Modal.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-[400px] bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-xl z-[100] transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <LogOut className="w-5 h-5" />
                </div>
                <Modal.Title className="text-lg font-bold">
                  Leave {isChallenge ? 'Challenge' : 'Leaderboard'}
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
