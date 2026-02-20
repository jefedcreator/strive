'use client';

import React from 'react';
import { type ApiError, type ClubListItem } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/primitives/dropdown-menu';
import axios, { type AxiosError } from 'axios';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/primitives/Modal';
import { Button } from '@/primitives/Button';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface ClubCardProps {
  club: ClubListItem;
}

import {
  Users,
  MoreVertical,
  LogIn,
  UserPlus,
  Trash2,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export const ClubCard: React.FC<ClubCardProps> = ({ club }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const currentUserId = session?.user?.id;
  const isCreator = currentUserId ? club.createdById === currentUserId : false;
  const isInactive = !club.isActive;
  const memberCount = club.members ?? 0;
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  const joinMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(
        `/api/clubs/${club.id}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${session?.user.token}` },
        }
      );
      return res.data;
    },
    onSuccess: async () => {
      toast.success(
        club.isPublic
          ? 'Successfully joined the club!'
          : 'Join request sent. Waiting for owner approval.'
      );
      await queryClient.invalidateQueries({ queryKey: ['clubs'] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? 'Failed to join club');
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const promise = axios.post(
        `/api/clubs/${club.id}/invites`,
        {},
        {
          headers: { Authorization: `Bearer ${session?.user.token}` },
        }
      );

      toast.promise(promise, {
        loading: 'Generating invite...',
        success: (data) => {
          handleInvite(String(data.data.data.id));
          return club.isPublic
            ? 'Successfully invited to the club!'
            : 'Join request sent. Waiting for owner approval.';
        },
        error: (error: AxiosError<ApiError>) => {
          return error.response?.data?.message ?? 'Failed to invite to club';
        },
      });

      const res = await promise;
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clubs'] });
    },
  });

  const handleInvite = (inviteId: string) => {
    const inviteUrl = `${window.location.origin}/clubs/${club.id}/invites/${inviteId}`;
    navigator.clipboard
      .writeText(inviteUrl)
      .then(() => {
        toast.success('Invite link copied to clipboard!');
      })
      .catch(() => {
        toast.error('Failed to copy invite link');
      });
  };

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.delete(`/api/clubs/${club.id}`, {
        headers: { Authorization: `Bearer ${session?.user.token}` },
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('Club deleted successfully!');
      router.refresh();
      setIsDeleteModalOpen(false);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? 'Failed to delete club');
    },
  });

  return (
    <motion.div
      whileHover={{
        y: -4,
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      }}
      whileTap={{
        scale: 0.98,
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      }}
      className={`relative bg-[#FAFAFA] dark:bg-[#0A0A0A] rounded-[24px] p-6 shadow-sm border border-black/5 dark:border-white/[0.08] hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-300 group overflow-hidden ${isInactive ? 'opacity-75 hover:opacity-100' : ''}`}
    >
      {/* Subtle Inner Glow on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10 flex justify-between items-start mb-5">
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl overflow-hidden shrink-0 border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex flex-col justify-center items-center">
            {club.image ? (
              <Image
                alt={club.name}
                width={56}
                height={56}
                className={`h-full w-full object-cover group-hover:scale-110 transition-transform duration-500 ${isInactive ? 'grayscale' : ''}`}
                src={club.image}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-primary/10 to-primary/5 dark:from-white/10 dark:to-white/5 flex items-center justify-center text-primary dark:text-white group-hover:scale-110 transition-transform duration-500">
                <Users className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <span
              className={`text-[10px] font-bold ${club.isPublic ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10' : 'text-purple-600 dark:text-purple-400 bg-purple-500/10'} px-2.5 py-0.5 rounded-full uppercase tracking-wider w-fit`}
            >
              {club.isPublic ? 'Public' : 'Private'}
            </span>
            <h3 className="font-extrabold tracking-tight text-lg text-gray-900 dark:text-white mt-1.5 truncate max-w-[170px] group-hover:text-primary transition-colors duration-300">
              {club.name}
            </h3>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 outline-none backdrop-blur-sm">
              <MoreVertical className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-44 bg-card-light dark:bg-card-dark border-gray-200 dark:border-gray-800"
            align="end"
          >
            <DropdownMenuItem
              onClick={() => joinMutation.mutate()}
              disabled={joinMutation.isPending || isInactive}
              className="focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer gap-2"
            >
              <LogIn className="w-4 h-4" />
              {joinMutation.isPending ? 'Joining...' : 'Join'}
            </DropdownMenuItem>
            {isCreator && (
              <DropdownMenuItem
                onClick={() => inviteMutation.mutate()}
                disabled={inviteMutation.isPending || isInactive}
                className="focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Invite
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
      </div>

      <p className="relative z-10 text-[13px] text-gray-500 dark:text-gray-400/90 mb-6 leading-relaxed line-clamp-2 min-h-[44px]">
        {club.description ?? 'No description provided.'}
      </p>

      <div className="relative z-10 flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400/80 mb-6 space-x-4">
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1" />
          {club.slug}
        </div>
        <div className="flex items-center">
          {isInactive ? (
            <XCircle className="w-4 h-4 mr-1" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-1" />
          )}
          {isInactive ? 'Inactive' : 'Active'}
        </div>
      </div>

      <div className="relative z-10 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400/70" />
          <span className="text-[13px] font-semibold tracking-tight text-gray-500 dark:text-gray-400">
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </span>
        </div>

        <a
          href={`/clubs/${club.id}`}
          className="group/link text-[13px] font-bold text-gray-900 dark:text-white flex items-center bg-gray-100 dark:bg-white/5 hover:bg-primary hover:text-white dark:hover:bg-primary px-3 py-1.5 rounded-full transition-all duration-300"
        >
          Details{' '}
          <ArrowRight className="w-3.5 h-3.5 ml-1 text-gray-400 group-hover/link:text-white group-hover/link:translate-x-1 transition-all" />
        </a>
      </div>

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
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </Modal.Content>
        </Modal.Portal>
      </Modal>
    </motion.div>
  );
};
