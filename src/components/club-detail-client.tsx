'use client';

import { clubValidatorSchema } from '@/backend/validators/club.validator';
import { ClubModal, type ClubFormValues } from '@/components/club-modal';
import { FadeInItem, FadeInStagger } from '@/components/fade-in';
import { Button } from '@/primitives/Button';
import { Modal } from '@/primitives/Modal';
import { type ApiError, type ApiResponse, type ClubDetail } from '@/types';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/primitives/dropdown-menu';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Edit2,
  LogOut,
  LogIn,
  MoreHorizontal,
  Trophy,
  User,
  Users,
} from 'lucide-react';

interface ClubDetailClientProps {
  initialData: ApiResponse<ClubDetail | null>;
}

export const ClubDetailClient: React.FC<ClubDetailClientProps> = ({
  initialData,
}) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const currentUserId = session?.user?.id;

  const isCreator = currentUserId
    ? initialData.data?.createdById === currentUserId
    : false;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const { data: response } = useQuery<ApiResponse<ClubDetail | null>>({
    queryKey: ['club', initialData.data?.id],
    queryFn: async () => {
      const { data } = await axios.get<ApiResponse<ClubDetail>>(
        `/api/clubs/${initialData.data!.id}`,
        { headers: { Authorization: `Bearer ${session?.user.token}` } }
      );
      return data;
    },
    initialData,
    staleTime: Infinity,
  });

  const club = response.data!;
  const isMember = currentUserId
    ? club.members.some((m) => m.userId === currentUserId)
    : false;
  const isInactive = !club.isActive;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<ClubFormValues>({
    resolver: zodResolver(clubValidatorSchema),
    defaultValues: {
      name: club.name,
      slug: club.slug,
      description: club.description ?? '',
      isPublic: club.isPublic,
      isActive: club.isActive,
    },
  });

  const nameRegister = register('name');
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    void nameRegister.onChange(e);
    const value = e.target.value;
    if (value) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', generatedSlug, { shouldValidate: true });
    }
  };

  const editClubMutation = useMutation({
    mutationFn: async (data: ClubFormValues) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('slug', data.slug);
      if (data.description) formData.append('description', data.description);
      formData.append('isPublic', String(data.isPublic));
      formData.append('isActive', String(data.isActive));
      if (thumbnail) formData.append('image', thumbnail);

      const res = await axios.put(`/api/clubs/${club.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${session?.user.token}`,
        },
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('Club updated successfully!');
      await queryClient.invalidateQueries({ queryKey: ['club', club.id] });
      await queryClient.invalidateQueries({ queryKey: ['clubs'] });
      setIsEditModalOpen(false);
      setThumbnail(null);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? 'Failed to update club');
    },
  });

  const exitMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.delete(`/api/clubs/${club.id}/exit`, {
        headers: { Authorization: `Bearer ${session?.user.token}` },
      });
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['club', club.id] });
      await queryClient.invalidateQueries({ queryKey: ['clubs'] });
      router.push('/clubs');
    },
  });

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
      await queryClient.invalidateQueries({ queryKey: ['club', club.id] });
      await queryClient.invalidateQueries({ queryKey: ['clubs'] });
      // router.refresh()
    },
  });

  const onSubmit = (data: ClubFormValues) => {
    editClubMutation.mutate(data);
  };

  return (
    <FadeInStagger className="flex flex-col h-full px-4 md:px-0 mt-20 lg:mt-0 pb-10">
      {/* Back link */}
      <FadeInItem>
        <Link
          href="/clubs"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-5 w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Clubs
        </Link>
      </FadeInItem>

      {/* Hero Banner */}
      <FadeInItem>
        <div className="relative w-full rounded-2xl overflow-hidden mb-3">
          {/* Background: image or gradient */}
          {club.image ? (
            <>
              <Image
                src={club.image}
                alt={club.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 dark:bg-black/50" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 via-teal-500/20 to-blue-500/10 dark:from-emerald-500/20 dark:via-teal-600/15 dark:to-blue-700/5" />
              <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />
            </>
          )}
          {/* <>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 via-teal-500/20 to-blue-500/10 dark:from-emerald-500/20 dark:via-teal-600/15 dark:to-blue-700/5" />
            <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />
          </> */}

          {/* Banner content */}
          <div className="relative flex flex-col items-center justify-center text-center px-16 py-12 md:py-16">
            {!club.image && (
              <div className="w-12 h-12 rounded-2xl bg-white/20 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4 shadow-inner">
                <Users className="w-6 h-6 text-white drop-shadow" />
              </div>
            )}
            <h1
              className={`text-2xl md:text-3xl font-black tracking-tight drop-shadow-md mb-3 ${
                club.image ? 'text-white' : 'text-gray-900 dark:text-white'
              }`}
            >
              {club.name}
            </h1>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide backdrop-blur-sm ${
                  club.isPublic
                    ? 'text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-900/40'
                    : 'text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-900/40'
                }`}
              >
                {club.isPublic ? 'Public' : 'Private'}
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide backdrop-blur-sm ${
                  club.isActive
                    ? 'text-green-700 dark:text-green-300 bg-green-100/70 dark:bg-green-900/40'
                    : 'text-gray-600 dark:text-gray-400 bg-white/40 dark:bg-white/10'
                }`}
              >
                {club.isActive ? 'Active' : 'Inactive'}
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
                className="w-44 bg-card-light dark:bg-card-dark border-gray-200 dark:border-gray-800"
              >
                {isCreator && (
                  <>
                    <DropdownMenuItem
                      onClick={() => setIsEditModalOpen(true)}
                      className="flex items-center gap-2 cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-800"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Club
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
                  </>
                )}

                {!isMember ? (
                  <DropdownMenuItem
                    onClick={() =>
                      toast.promise(joinMutation.mutateAsync(), {
                        loading: 'Joining club…',
                        success: club.isPublic
                          ? 'Successfully joined the club!'
                          : 'Join request sent. Waiting for owner approval.',
                        error: (err: AxiosError<ApiError>) =>
                          err.response?.data?.message ?? 'Failed to join club',
                      })
                    }
                    disabled={joinMutation.isPending || isInactive}
                    className="focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer gap-2"
                  >
                    <LogIn className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    {joinMutation.isPending ? 'Joining...' : 'Join Club'}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => setIsLeaveModalOpen(true)}
                    disabled={exitMutation.isPending}
                    className="flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10"
                  >
                    <LogOut className="w-4 h-4" />
                    Leave Club
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </FadeInItem>

      {/* Metadata pill row */}
      <FadeInItem>
        <div className="flex flex-wrap items-center gap-2 mb-8 px-1">
          {club.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mr-2 max-w-xl">
              {club.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">
              <Users className="w-3.5 h-3.5" />
              {club._count.members}{' '}
              {club._count.members === 1 ? 'member' : 'members'}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">
              <Trophy className="w-3.5 h-3.5" />
              {club._count.leaderboards}{' '}
              {club._count.leaderboards === 1 ? 'leaderboard' : 'leaderboards'}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">
              <Calendar className="w-3.5 h-3.5" />
              Since {new Date(club.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </FadeInItem>

      {/* Leaderboards + Members grid */}
      <FadeInStagger className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Leaderboards */}
        <FadeInItem>
          <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 shadow-soft overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-white">
                Leaderboards
              </h2>
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                {club.leaderboards.length}
              </span>
            </div>

            {club.leaderboards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                  <Trophy className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                  No leaderboards yet
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                  Create a leaderboard to start competing within this club.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {club.leaderboards.map((lb) => {
                  const isCompleted = lb.expiryDate
                    ? new Date(lb.expiryDate) < new Date()
                    : false;
                  return (
                    <Link
                      key={lb.id}
                      href={`/leaderboards/${lb.id}`}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 dark:bg-white/10 flex items-center justify-center text-primary dark:text-white">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors">
                            {lb.name}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {isCompleted ? 'Ended' : 'Active'}
                            {lb.expiryDate &&
                              ` · ${new Date(lb.expiryDate).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </FadeInItem>

        {/* Members */}
        <FadeInItem>
          <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 shadow-soft overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-white">
                Members
              </h2>
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                {club._count.members}
              </span>
            </div>

            {club.members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                  No members yet
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                  Invite members to grow your club community.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {club.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                        {member.user.avatar ? (
                          <Image
                            src={member.user.avatar}
                            alt={member.user.fullname ?? member.user.username}
                            className="w-full h-full object-cover"
                            width={36}
                            height={36}
                          />
                        ) : (
                          <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.user.fullname ?? member.user.username}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {`Joined ${new Date(member.joinedAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                        member.role === 'ADMIN'
                          ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
                          : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeInItem>
      </FadeInStagger>

      <ClubModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        type="edit"
        register={register}
        control={control}
        errors={errors}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        isPending={editClubMutation.isPending}
        existingImageUrl={club.image}
        onThumbnailChange={(file) => setThumbnail(file)}
        nameRegister={nameRegister}
        onNameChange={handleNameChange}
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
                  Leave Club
                </Modal.Title>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to leave{' '}
                <span className="font-bold text-gray-900 dark:text-white">
                  &quot;{club.name}&quot;
                </span>
                ? You will lose access to its leaderboards and chat instantly.
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
                      loading: 'Leaving club…',
                      success: 'You have left the club.',
                      error: (err: AxiosError<ApiError>) =>
                        err.response?.data?.message ?? 'Failed to leave club',
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
