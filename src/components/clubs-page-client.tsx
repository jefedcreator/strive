'use client';

import {
  clubValidatorSchema,
} from '@/backend/validators/club.validator';
import { ClubCard } from '@/components/club-card';
import { ClubModal, type ClubFormValues } from '@/components/club-modal';
import { Button } from '@/primitives/Button';
import { type ClubListItem, type PaginatedApiResponse } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ClubsPageClientProps {
  initialData: PaginatedApiResponse<ClubListItem[]>;
}

export const ClubsPageClient: React.FC<ClubsPageClientProps> = ({ initialData }) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const { data: clubsResponse } = useQuery<PaginatedApiResponse<ClubListItem[]>>({
    queryKey: ['clubs'],
    queryFn: async () => {
      const { data } = await axios.get<PaginatedApiResponse<ClubListItem[]>>('/api/clubs', {
        headers: { Authorization: `Bearer ${session?.user.token}` },
      });
      return data;
    },
    initialData,
    staleTime: Infinity,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
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

  const nameValue = watch('name');
  useEffect(() => {
    if (nameValue) {
      const generatedSlug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', generatedSlug, { shouldValidate: true });
    }
  }, [nameValue, setValue]);

  const createClubMutation = useMutation({
    mutationFn: async (data: ClubFormValues) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('slug', data.slug);
      if (data.description) formData.append('description', data.description);
      formData.append('isPublic', String(data.isPublic));
      formData.append('isActive', String(data.isActive));

      if (thumbnail) {
        formData.append('image', thumbnail);
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
      await queryClient.invalidateQueries({ queryKey: ['clubs'] });
      setIsModalOpen(false);
      reset();
      setThumbnail(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? 'Failed to create club');
    },
  });

  const onSubmit = (data: ClubFormValues) => {
    createClubMutation.mutate(data);
  };

  const clubs = clubsResponse.data;

  const filteredClubs = useMemo(() => {
    return clubs.filter(
      (club) =>
        club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clubs, searchTerm]);

  return (
    <div className="flex flex-col h-full">
      {/* Page Header Area */}
      <div className="mb-6 md:mb-10">
        <nav className="flex text-sm text-gray-500 dark:text-gray-400 mb-2 md:hidden">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span className="text-primary dark:text-white font-medium">
            Clubs
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              My Clubs
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base mt-1">
              Manage your fitness communities.
            </p>
          </div>

          <Button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Create Club
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="relative mb-6">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <span className="material-symbols-outlined text-xl">search</span>
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark text-sm focus:ring-2 focus:ring-primary dark:focus:ring-white focus:border-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 shadow-sm transition-shadow"
          placeholder="Search your clubs..."
        />
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 pb-20 md:pb-0">
        {filteredClubs.length > 0 ? (
          filteredClubs.map((club) => <ClubCard key={club.id} club={club} />)
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">
              search_off
            </span>
            <p>No clubs found matching &quot;{searchTerm}&quot;</p>
          </div>
        )}
      </div>

      <ClubModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type="create"
        register={register}
        control={control}
        errors={errors}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        isPending={createClubMutation.isPending}
        onThumbnailChange={(file) => setThumbnail(file)}
      />
    </div>
  );
};
