'use client';

import React from 'react';
import { type LeaderboardListItem } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/primitives/dropdown-menu';
import axios from 'axios';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/primitives/Modal';
import { Button } from '@/primitives/Button';
import { useRouter } from 'next/navigation';

export interface LeaderboardCardProps {
  data: LeaderboardListItem;
}

export const Icon: React.FC<{ name: string; className?: string }> = ({ name, className = '' }) => {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
};

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ data }) => {
  const { data: session } = useSession();
    const router = useRouter();
  const currentUserId = session?.user?.id;
  const isCreator = currentUserId ? data.createdById === currentUserId : false;
  const isCompleted = data.expiryDate ? new Date(data.expiryDate) < new Date() : false;
  const participantsCount = data._count?.entries ?? 0;
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  const joinMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(`/api/leaderboards/${data.id}/join`, {}, {
        headers: { Authorization: `Bearer ${session?.user.token}` },
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success(
        data.isPublic
          ? 'Successfully joined the leaderboard!'
          : 'Join request sent. Waiting for owner approval.'
      );
      await queryClient.invalidateQueries({ queryKey: ['leaderboards'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? 'Failed to join leaderboard'
      );
    },
  });

    const inviteMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(`/api/leaderboards/${data.id}/invite`, {}, {
        headers: { Authorization: `Bearer ${session?.user.token}` },
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success(
        data.isPublic
          ? 'Successfully invited to the leaderboard!'
          : 'Join request sent. Waiting for owner approval.'
      );
      handleInvite()
      await queryClient.invalidateQueries({ queryKey: ['leaderboards'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? 'Failed to invite to leaderboard'
      );
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
      toast.success('Leaderboard deleted successfully!');
      // await queryClient.invalidateQueries({ queryKey: ['leaderboards'] });
      setIsDeleteModalOpen(false);
            router.refresh();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? 'Failed to delete leaderboard'
      );
    },
  });

  const handleInvite = () => {
    // Copy invite link to clipboard
    const inviteUrl = `${window.location.origin}/leaderboards/${data.id}?action=join`;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      toast.success('Invite link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy invite link');
    });
  };

  return (
    <div
      className={`bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all group ${!data.isActive || isCompleted ? 'opacity-75 hover:opacity-100' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`h-12 w-12 rounded-xl bg-primary/10 dark:bg-white/10 flex items-center justify-center text-primary dark:text-white`}
          >
            <Icon name="emoji_events" />
          </div>
          <div>
            
            <span
              className={`text-[10px] font-bold ${data.isPublic ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'} px-2 py-0.5 rounded-full uppercase tracking-wide`}
            >
              {data.isPublic ? 'Public' : 'Private'}
            </span>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mt-0.5 truncate max-w-[180px]">
              {data.name}
            </h3>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 outline-none">
              <Icon name="more_vert" className="text-lg" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-44 bg-card-light dark:bg-card-dark border-gray-200 dark:border-gray-800"
            align="end"
          >
            <DropdownMenuItem
              onClick={() => joinMutation.mutate()}
              disabled={joinMutation.isPending || isCompleted}
              className="focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer gap-2"
            >
              <Icon name="login" className="text-base" />
              {joinMutation.isPending ? 'Joining...' : 'Join'}
            </DropdownMenuItem>
            {isCreator && (
              <DropdownMenuItem
                onClick={() => inviteMutation.mutate()}
                disabled={inviteMutation.isPending || isCompleted}
                className="focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer gap-2"
              >
                <Icon name="person_add" className="text-base" />
                Invite
              </DropdownMenuItem>
            )}
            {isCreator && (
              <DropdownMenuItem
                onClick={() => setIsDeleteModalOpen(true)}
                className="focus:bg-red-50 dark:focus:bg-red-900/10 cursor-pointer gap-2 text-red-600 dark:text-red-400"
              >
                <Icon name="delete" className="text-base" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 min-h-[40px]">
        {data.description || 'No description provided.'}
      </p>

      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-5 space-x-4">
        <div className="flex items-center">
          <Icon name="groups" className="text-base mr-1" />
          {data.club?.name || 'General'}
        </div>
        <div className="flex items-center">
          <Icon
            name={isCompleted ? 'event' : 'schedule'}
            className="text-base mr-1"
          />
          {isCompleted ? 'Ended' : 'Active'}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="people" className="text-base text-gray-400" />
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {participantsCount} {participantsCount === 1 ? 'participant' : 'participants'}
          </span>
        </div>

        <a
          href={`/leaderboards/${data.id}`}
          className="text-sm font-semibold text-gray-900 dark:text-white flex items-center hover:underline"
        >
          {isCompleted ? 'Results' : 'View Board'}{' '}
          <Icon name="arrow_forward" className="text-sm ml-1" />
        </a>
      </div>

      <Modal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <Modal.Portal>
          <Modal.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-[400px] bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-xl z-[100]">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <Icon name="warning" className="text-xl" />
                </div>
                <Modal.Title className="text-lg font-bold">Delete Leaderboard</Modal.Title>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to delete <span className="font-bold text-gray-900 dark:text-white">"{data.name}"</span>? 
                This action cannot be undone and all data will be lost.
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
    </div>
  );
};
