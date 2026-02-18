'use client';

import { ClubCard } from '@/components/club-card';
import { CreateClubModal } from '@/components/club-modal';
import { Button } from '@/primitives/Button';
import { getClubs } from '@/server';
import { type ClubListItem, type PaginatedApiResponse } from '@/types';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';

interface ClubsPageClientProps {
  initialData: PaginatedApiResponse<ClubListItem[]>;
}

export const ClubsPageClient: React.FC<ClubsPageClientProps> = ({ initialData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: clubsResponse } = useQuery<PaginatedApiResponse<ClubListItem[]>>({
    queryKey: ['clubs'],
    queryFn: () => getClubs(),
    initialData,
    select: (data) => data,
  });

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

      <CreateClubModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
