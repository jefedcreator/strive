'use client';

import React from 'react';
import { type ClubListItem } from '@/types';
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

interface ClubCardProps {
  club: ClubListItem;
}

const Icon: React.FC<{ name: string; className?: string }> = ({
  name,
  className = '',
}) => <span className={`material-symbols-outlined ${className}`}>{name}</span>;

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
    onError: (error: any) => {
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
          handleInvite(data.data.data.id);
          return club.isPublic
            ? 'Successfully invited to the club!'
            : 'Join request sent. Waiting for owner approval.';
        },
        error: (error: any) =>
          error.response?.data?.message ?? 'Failed to invite to club',
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
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? 'Failed to delete club');
    },
  });

  return (
    <div
      className={`bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all group ${isInactive ? 'opacity-75 hover:opacity-100' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          {club.image ? (
            <img
              alt={club.name}
              className={`h-12 w-12 rounded-xl object-cover bg-gray-100 dark:bg-gray-800 ${isInactive ? 'grayscale' : ''}`}
              src={club.image}
            />
          ) : (
            <div className="h-12 w-12 rounded-xl bg-primary/10 dark:bg-white/10 flex items-center justify-center text-primary dark:text-white">
              <Icon name="groups" />
            </div>
          )}
          <div>
            <span
              className={`text-[10px] font-bold ${club.isPublic ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'} px-2 py-0.5 rounded-full uppercase tracking-wide`}
            >
              {club.isPublic ? 'Public' : 'Private'}
            </span>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mt-0.5 truncate max-w-[180px]">
              {club.name}
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
              disabled={joinMutation.isPending || isInactive}
              className="focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer gap-2"
            >
              <Icon name="login" className="text-base" />
              {joinMutation.isPending ? 'Joining...' : 'Join'}
            </DropdownMenuItem>
            {isCreator && (
              <DropdownMenuItem
                onClick={() => inviteMutation.mutate()}
                disabled={inviteMutation.isPending || isInactive}
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
        {club.description || 'No description provided.'}
      </p>

      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-5 space-x-4">
        <div className="flex items-center">
          <Icon name="groups" className="text-base mr-1" />
          {club.slug}
        </div>
        <div className="flex items-center">
          <Icon
            name={isInactive ? 'cancel' : 'check_circle'}
            className="text-base mr-1"
          />
          {isInactive ? 'Inactive' : 'Active'}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="people" className="text-base text-gray-400" />
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </span>
        </div>

        <a
          href={`/clubs/${club.id}`}
          className="text-sm font-semibold text-gray-900 dark:text-white flex items-center hover:underline"
        >
          View Details <Icon name="arrow_forward" className="text-sm ml-1" />
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
                <Modal.Title className="text-lg font-bold">
                  Delete Club
                </Modal.Title>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to delete{' '}
                <span className="font-bold text-gray-900 dark:text-white">
                  "{club.name}"
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
    </div>
  );
};
