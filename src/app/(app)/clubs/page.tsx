'use client';

import React, { useMemo, useState } from 'react';
import { type Club } from '@prisma/client';
import { ClubCard } from '@/components/club-card';
import { CreateClubModal } from '@/components/club-modal';
import { Button } from '@/primitives/Button';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { type PaginatedApiResponse } from '@/types';

const MOCK_CLUBS: Club[] = [
  {
    id: '1',
    name: 'The Runners Club',
    slug: 'runners-nyc',
    isActive: true,
    isPublic: false,
    memberCount: 124,
    description:
      'A community for dedicated marathon runners in NYC. Join us for weekly long runs.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD0qx6w3Y6YEWgzs2-AHUY2HiDgsIxTWnX2ohw5W9XpeMIZqCBj9iR71YnL57QTWD07gIP-qBbrBk1Uj4F6QpdU54XCbBO3uKSKneNLZ-MyzBUb5GryVM0597K3G9INW0f-wfQFZBysxpO1b4AL9Vv4CiPW2u7QTiabjUnBI8O0WMHSC7jUe1I1MTY0LUDg1y9yDqYu0Ppc9_xAPR6hElm4kATjvU96hhfCd3xavrPOK3c3bKx3KguzO4xksBDXIQtdKFiFU_MIx3U',
    createdAt: new Date('2023-01-15T10:00:00Z'),
    updatedAt: new Date('2023-06-20T15:30:00Z'),
    createdById: '',
  },
  {
    id: '2',
    name: 'Iron Lifters',
    slug: 'iron-lifters-global',
    memberCount: 42,
    description:
      'Strength training enthusiasts pushing limits. Share PRs and tips.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDTjIoHxDQHT2EHRkSkCJqGHdJIXVJ4ZguAjx9VmcBAuVpyssCfNi0r0glaZ6SdDlEqSrdKmLhUmVn6XZJMl8KnnMHe7ZrGRlZLFQ3m0eNFak4yhAJqQduUmybyk6OyOY3Ssl6U_NQfiqoppv0xqav-U9UAm-2ANu1koMAoUGk89qEKzL7MIFaesdC8dBdItjgJynBAX-G5Fm9kru5_WASfBEXa0x8PW2YtcMuYMdvL19IEl96ysf83a4opaWrilnhb6z6zIvZTPlM',
    isActive: true,
    isPublic: false,
    createdAt: new Date('2023-01-15T10:00:00Z'),
    updatedAt: new Date('2023-06-20T15:30:00Z'),
    createdById: '',
  },
];

const ClubsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: clubsResponse, isLoading } = useQuery<PaginatedApiResponse<Club[]>>({
    queryKey: ['clubs'],
    queryFn: async () => {
      const res = await axios.get('/api/clubs');
      return res.data;
    },
  });

  const clubs = clubsResponse?.data || MOCK_CLUBS;

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
            <p>No clubs found matching "{searchTerm}"</p>
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

export default ClubsPage;
