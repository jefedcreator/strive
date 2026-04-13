'use client';

import React from 'react';
import { type ApiError, type ClubListItem } from '@/types';

import api from '@/utils/axios';
import { type AxiosError } from 'axios';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';
import { Modal } from '@/primitives/Modal';
import { Button } from '@/primitives/Button';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ShareModal } from '@/components/share-modal';
import {
  MoreHorizontal,
  LogIn,
  UserPlus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface ClubCardProps {
  club: ClubListItem;
  showType?: boolean;
}

export const ClubCard: React.FC<ClubCardProps> = ({ club, showType }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const currentUserId = session?.user?.id;
  const isCreator = currentUserId ? club.createdById === currentUserId : false;
  const isMember = club.isMember;
  const isInactive = !club.isActive;
  const memberCount = club.members ?? 0;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [shareInviteUrl, setShareInviteUrl] = React.useState('');
  const hasMenuItems = !isMember || (isMember && club.isPublic) || isCreator;

  const joinMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(
        `/clubs/${club.id}/join`,
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
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? 'Failed to join club');
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(
        `/clubs/${club.id}/invites`,
        {},
        {
          headers: { Authorization: `Bearer ${session?.user.token}` },
        }
      );
      return res.data;
    },
    onSuccess: async (data) => {
      const inviteId = String(data.data.id);
      const inviteUrl = `${window.location.origin}/clubs/${club.id}/invites/${inviteId}`;
      setShareInviteUrl(inviteUrl);
      setIsShareModalOpen(true);
      router.refresh();
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? 'Failed to invite user');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/clubs/${club.id}`, {
        headers: { Authorization: `Bearer ${session?.user.token}` },
      });
      return res.data;
    },
    onSuccess: async () => {
      router.refresh();
      setIsDeleteModalOpen(false);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? 'Failed to delete club');
    },
  });

  return (
    <>
      <motion.div
        whileHover={{
          y: -2,
          transition: { type: 'spring', stiffness: 400, damping: 25 },
        }}
        className={`group flex flex-col ${isInactive ? 'opacity-60' : ''}`}
      >
        {/* Cover image area */}
        <Link href={`/clubs/${club.id}`} className="block relative">
          <div className="relative w-full aspect-[4/3] rounded-[16px] overflow-hidden bg-gray-100 dark:bg-white/5 mb-3">
            {club.image ? (
              <Image
                alt={club.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className={`object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out ${isInactive ? 'grayscale' : ''}`}
                src={club.image}
              />
            ) : (
              <Image
                alt={club.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                src={`/api/og?name=${encodeURIComponent(club.name)}&type=club`}
              />
            )}

            {/* Visibility badge */}
            <span
              className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm
                ${
                  club.isPublic
                    ? 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/20'
                    : 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/20'
                }`}
            >
              {club.isPublic ? 'Public' : 'Private'}
            </span>

            {showType && (
              <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-white/20 text-white border border-white/20 backdrop-blur-sm">
                Club
              </span>
            )}
          </div>
        </Link>

        {/* Footer row */}
        <div className="flex items-start justify-between gap-2 px-0.5">
          <Link href={`/clubs/${club.id}`} className="flex-1 min-w-0">
            <h3 className="font-semibold text-[14px] leading-snug text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors duration-200">
              {club.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[12px] text-gray-400 dark:text-gray-500">
                {memberCount} {memberCount === 1 ? 'member' : 'members'}
              </span>
              {isInactive ? (
                <span className="flex items-center gap-0.5 text-[11px] text-red-400 dark:text-red-500">
                  <XCircle className="w-3 h-3" /> Inactive
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-[11px] text-green-500 dark:text-green-400">
                  <CheckCircle className="w-3 h-3" /> Active
                </span>
              )}
            </div>
          </Link>

          {/* Action buttons */}
          {hasMenuItems && (
            <div className="flex items-center gap-1.5 self-end shrink-0 mb-0.5">
              {!isMember && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={joinMutation.isPending || isInactive}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toast.promise(joinMutation.mutateAsync(), {
                      loading: 'Joining club…',
                      success: club.isPublic
                        ? 'Successfully joined the club!'
                        : 'Join request sent. Waiting for owner approval.',
                      error: (err: AxiosError<ApiError>) =>
                        err.response?.data?.message ?? 'Failed to join club',
                    });
                  }}
                  className="w-8 h-8 p-0 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border-gray-200 dark:border-gray-800 shadow-sm transition-all"
                  title="Join"
                >
                  <LogIn className="w-4 h-4" />
                </Button>
              )}
              {isMember && (club.isPublic || isCreator) && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={inviteMutation.isPending || isInactive}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toast.promise(inviteMutation.mutateAsync(), {
                      loading: 'Generating invite link…',
                      success: 'Invite link ready!',
                      error: (err: AxiosError<ApiError>) =>
                        err.response?.data?.message ??
                        'Failed to generate invite',
                    });
                  }}
                  className="w-8 h-8 p-0 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border-gray-200 dark:border-gray-800 shadow-sm transition-all"
                  title="Invite"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              )}
              {isCreator && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDeleteModalOpen(true);
                  }}
                  className="w-8 h-8 p-0 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/10 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 border-gray-200 dark:border-gray-800 shadow-sm transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <ShareModal
        open={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
        entityId={club.id}
        name={club.name}
        inviteUrl={shareInviteUrl}
        image={club.image}
        isPublic={club.isPublic}
        variant="club"
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
                  Delete Club
                </Modal.Title>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to delete{' '}
                <span className="font-bold text-gray-900 dark:text-white">
                  &quot;{club.name}&quot;
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
                      loading: 'Deleting club…',
                      success: 'Club deleted successfully!',
                      error: (err: AxiosError<ApiError>) =>
                        err.response?.data?.message ?? 'Failed to delete club',
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
