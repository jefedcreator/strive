'use client';

import React from 'react';
import { type ApiError, type LeaderboardListItem } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/primitives/dropdown-menu';
import axios, { type AxiosError } from 'axios';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';
import { Modal } from '@/primitives/Modal';
import { Button } from '@/primitives/Button';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ShareModal } from '@/components/share-modal';
import {
  MoreHorizontal,
  LogIn,
  UserPlus,
  Trash2,
  AlertTriangle,
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export interface LeaderboardCardProps {
  data: LeaderboardListItem;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ data }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const currentUserId = session?.user?.id;
  const isCreator = currentUserId ? data.createdById === currentUserId : false;
  const isMember = data.isMember;
  const isCompleted = data.expiryDate
    ? new Date(data.expiryDate) < new Date()
    : false;
  const isInactive = !data.isActive || isCompleted;
  const participantsCount = data._count?.entries ?? 0;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [shareInviteUrl, setShareInviteUrl] = React.useState('');
  const hasMenuItems = !isMember || (isMember && data.isPublic) || isCreator;

  const joinMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(
        `/api/leaderboards/${data.id}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${session?.user.token}` },
        }
      );
      return res.data;
    },
    onSuccess: async () => {
      router.refresh();
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(
        `/api/leaderboards/${data.id}/invites`,
        {},
        {
          headers: { Authorization: `Bearer ${session?.user.token}` },
        }
      );
      return res.data;
    },
    onSuccess: async (res) => {
      const inviteId = String(res.data.id);
      const inviteUrl = `${window.location.origin}/leaderboards/${data.id}/invites/${inviteId}`;
      setShareInviteUrl(inviteUrl);
      setIsShareModalOpen(true);
      router.refresh();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.delete(`/api/leaderboards/${data.id}`, {
        headers: { Authorization: `Bearer ${session?.user.token}` },
      });
      return res.data;
    },
    onSuccess: async () => {
      setIsDeleteModalOpen(false);
      router.refresh();
    },
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
          y: -2,
          transition: { type: 'spring', stiffness: 400, damping: 25 },
        }}
        className={`group flex flex-col ${isInactive ? 'opacity-60' : ''}`}
      >
        {/* Cover image area */}
        <Link href={`/leaderboards/${data.id}`} className="block relative">
          <div className="relative w-full aspect-[4/3] rounded-[16px] overflow-hidden bg-gray-100 dark:bg-white/5 mb-3">
            <Image
              alt={data.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              src={`/api/og?name=${encodeURIComponent(data.name)}&type=leaderboard`}
            />

            {/* Visibility badge */}
            <span
              className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm
                ${
                  data.isPublic
                    ? 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/20'
                    : 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/20'
                }`}
            >
              {data.isPublic ? 'Public' : 'Private'}
            </span>

            {/* Club association badge */}
            {data.club?.name && (
              <span className="absolute bottom-2.5 left-2.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/30 dark:bg-black/50 text-white backdrop-blur-sm">
                {data.club.name}
              </span>
            )}
          </div>
        </Link>

        {/* Footer row */}
        <div className="flex items-start justify-between gap-2 px-0.5">
          <Link href={`/leaderboards/${data.id}`} className="flex-1 min-w-0">
            <h3 className="font-semibold text-[14px] leading-snug text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors duration-200">
              {data.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[12px] text-gray-400 dark:text-gray-500">
                {participantsCount}{' '}
                {participantsCount === 1 ? 'participant' : 'participants'}
              </span>
              {isCompleted ? (
                <span className="flex items-center gap-0.5 text-[11px] text-gray-400 dark:text-gray-500">
                  <Calendar className="w-3 h-3" /> Ended
                </span>
              ) : data.isActive ? (
                <span className="flex items-center gap-0.5 text-[11px] text-green-500 dark:text-green-400">
                  <CheckCircle className="w-3 h-3" /> Active
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-[11px] text-red-400 dark:text-red-500">
                  <XCircle className="w-3 h-3" /> Inactive
                </span>
              )}
            </div>
          </Link>

          {/* Overflow menu */}
          {hasMenuItems && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="shrink-0 mt-0.5 w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/8 transition-colors outline-none">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-44 bg-card-light dark:bg-card-dark border-gray-200 dark:border-gray-800"
                align="end"
              >
                {!isMember && (
                  <DropdownMenuItem
                    onClick={() =>
                      toast.promise(joinMutation.mutateAsync(), {
                        loading: 'Joining leaderboard…',
                        success: data.isPublic
                          ? 'Successfully joined the leaderboard!'
                          : 'Join request sent. Waiting for owner approval.',
                        error: (err: AxiosError<ApiError>) =>
                          err.response?.data?.message ??
                          'Failed to join leaderboard',
                      })
                    }
                    disabled={joinMutation.isPending || isCompleted}
                    className="focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    {joinMutation.isPending ? 'Joining...' : 'Join'}
                  </DropdownMenuItem>
                )}
                {isMember && (data.isPublic || isCreator) && (
                  <DropdownMenuItem
                    onClick={() =>
                      toast.promise(inviteMutation.mutateAsync(), {
                        loading: 'Generating invite link…',
                        success: 'Invite link ready!',
                        error: (err: AxiosError<ApiError>) =>
                          err.response?.data?.message ??
                          'Failed to generate invite',
                      })
                    }
                    disabled={inviteMutation.isPending || isCompleted}
                    className="focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    {inviteMutation.isPending ? 'Generating...' : 'Invite'}
                  </DropdownMenuItem>
                )}
                {isCreator && (
                  <DropdownMenuItem
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="focus:bg-red-50 dark:focus:bg-red-900/10 cursor-pointer gap-2 text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </motion.div>

      <ShareModal
        open={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
        name={data.name}
        inviteUrl={shareInviteUrl}
        isPublic={data.isPublic}
        variant="leaderboard"
      />

      <Modal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <Modal.Portal>
          <Modal.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-[400px] bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-xl z-[100]">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <Modal.Title className="text-lg font-bold">
                  Delete Leaderboard
                </Modal.Title>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to delete{' '}
                <span className="font-bold text-gray-900 dark:text-white">
                  &quot;{data.name}&quot;
                </span>
                ? This action cannot be undone and all data will be lost.
              </p>

              <div className="flex gap-3 justify-end mt-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={deleteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    toast.promise(deleteMutation.mutateAsync(), {
                      loading: 'Deleting leaderboard…',
                      success: 'Leaderboard deleted successfully!',
                      error: (err: AxiosError<ApiError>) =>
                        err.response?.data?.message ??
                        'Failed to delete leaderboard',
                    })
                  }
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </Modal.Content>
        </Modal.Portal>
      </Modal>
    </>
  );
};
