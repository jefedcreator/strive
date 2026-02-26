'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios, { type AxiosError } from 'axios';
import { toast } from 'sonner';
import { PlusCircle, Users } from 'lucide-react';

import { clubValidatorSchema } from '@/backend/validators/club.validator';
import { leaderboardValidatorSchema } from '@/backend/validators/leaderboard.validator';
import { ClubModal, type ClubFormValues } from '@/components/club-modal';
import { LeaderboardModal, type LeaderboardFormValues } from '@/components/leaderboard-modal';
import { type ApiError, type ApiResponse, type ClubListItem } from '@/types';

export function HomeQuickActions() {
  const { data: session } = useSession();
  const router = useRouter();

  // Modal states
  const [isClubModalOpen, setIsClubModalOpen] = useState(false);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
  const [clubThumbnail, setClubThumbnail] = useState<File | null>(null);

  // --- Club Form & Mutation ---
  const {
    register: registerClub,
    handleSubmit: handleSubmitClub,
    control: controlClub,
    formState: { errors: errorsClub },
    reset: resetClub,
    setValue: setClubValue,
  } = useForm<ClubFormValues>({
    resolver: zodResolver(clubValidatorSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      isPublic: true,
      isActive: true,
    },
  });

  const clubNameRegister = registerClub('name');
  const handleClubNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    void clubNameRegister.onChange(e);
    const value = e.target.value;
    if (value) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setClubValue('slug', generatedSlug, { shouldValidate: true });
    }
  };

  const createClubMutation = useMutation({
    mutationFn: async (data: ClubFormValues) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('slug', data.slug);
      if (data.description) formData.append('description', data.description);
      formData.append('isPublic', String(data.isPublic));
      formData.append('isActive', String(data.isActive));

      if (clubThumbnail) {
        formData.append('image', clubThumbnail);
      }

      const res = await axios.post('/api/clubs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${session?.user.token}`,
        },
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('Club created successfully!');
      router.refresh();
      setIsClubModalOpen(false);
      resetClub();
      setClubThumbnail(null);
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? 'Failed to create club');
    },
  });

  // --- Leaderboard Form & Mutation ---
  // We need the user's clubs for the dropdown in the leaderboard modal
  const { data: clubs = [] } = useQuery<ApiResponse<ClubListItem[]>, Error, ClubListItem[]>({
    queryKey: ['clubs'],
    queryFn: async () => {
      const res = await axios.get('/api/clubs', {
        headers: { Authorization: `Bearer ${session?.user.token}` },
      });
      return res.data;
    },
    select: (response) => response?.data ?? [],
    enabled: isLeaderboardModalOpen && !!session?.user.token,
  });

  const {
    register: registerLeaderboard,
    handleSubmit: handleSubmitLeaderboard,
    control: controlLeaderboard,
    formState: { errors: errorsLeaderboard },
    reset: resetLeaderboard,
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

  const createLeaderboardMutation = useMutation({
    mutationFn: async (data: LeaderboardFormValues) => {
      const res = await axios.post('/api/leaderboards', data, {
        headers: { Authorization: `Bearer ${session?.user.token}` },
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('Leaderboard created successfully!');
      router.refresh();
      setIsLeaderboardModalOpen(false);
      resetLeaderboard();
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? 'Failed to create leaderboard');
    },
  });

  return (
    <div className="bg-card-light dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-soft p-8">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setIsLeaderboardModalOpen(true)}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-200 group"
        >
          <PlusCircle className="text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white w-6 h-6" />
          <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Create Leaderboard
          </span>
        </button>
        <button
          onClick={() => setIsClubModalOpen(true)}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-200 group"
        >
          <Users className="text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white w-6 h-6" />
          <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Create Club
          </span>
        </button>
      </div>

      {/* Modals */}
      <ClubModal
        isOpen={isClubModalOpen}
        onClose={() => setIsClubModalOpen(false)}
        type="create"
        register={registerClub}
        control={controlClub}
        errors={errorsClub}
        handleSubmit={handleSubmitClub}
        onSubmit={(data) => createClubMutation.mutate(data)}
        isPending={createClubMutation.isPending}
        onThumbnailChange={(file) => setClubThumbnail(file)}
        nameRegister={clubNameRegister}
        onNameChange={handleClubNameChange}
      />

      <LeaderboardModal
        isOpen={isLeaderboardModalOpen}
        onClose={() => setIsLeaderboardModalOpen(false)}
        type="create"
        register={registerLeaderboard}
        control={controlLeaderboard}
        errors={errorsLeaderboard}
        handleSubmit={handleSubmitLeaderboard}
        onSubmit={(data) => createLeaderboardMutation.mutate(data)}
        isPending={createLeaderboardMutation.isPending}
        clubs={clubs}
      />
    </div>
  );
}
