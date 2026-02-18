'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Link from 'next/link';
import { ClubModal } from '@/components/club-modal';
import { type ApiResponse, type ClubDetail } from '@/types';

const Icon: React.FC<{ name: string; className?: string }> = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface ClubDetailClientProps {
  initialData: ApiResponse<ClubDetail | null>;
}

export const ClubDetailClient: React.FC<ClubDetailClientProps> = ({ initialData }) => {
  const { data: session } = useSession();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  return (
    <div className="flex flex-col h-full">
      {/* Back link */}
      <Link
        href="/clubs"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6 w-fit"
      >
        <Icon name="arrow_back" className="text-base" />
        Back to Clubs
      </Link>

      {/* Header */}
      <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 shadow-soft p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            {club.image ? (
              <img
                src={club.image}
                alt={club.name}
                className="w-16 h-16 rounded-xl object-cover bg-gray-100 dark:bg-gray-800 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center shrink-0">
                <Icon name="groups" className="text-2xl text-gray-400 dark:text-gray-500" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {club.name}
                </h1>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                    club.isPublic
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                  }`}
                >
                  {club.isPublic ? 'Public' : 'Private'}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                    club.isActive
                      ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                      : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  {club.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">/{club.slug}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl">
                {club.description || 'No description provided.'}
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Icon name="people" className="text-sm" />
                  <span>
                    {club._count.members} {club._count.members === 1 ? 'member' : 'members'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="emoji_events" className="text-sm" />
                  <span>
                    {club._count.leaderboards}{' '}
                    {club._count.leaderboards === 1 ? 'leaderboard' : 'leaderboards'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="calendar_today" className="text-sm" />
                  <span>Created {new Date(club.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors shrink-0"
          >
            <Icon name="edit" className="text-base" />
            Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Leaderboards */}
        <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 shadow-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white">Leaderboards</h2>
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
              {club.leaderboards.length}
            </span>
          </div>

          {club.leaderboards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                <Icon name="emoji_events" className="text-xl text-gray-400 dark:text-gray-500" />
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
                        <Icon name="emoji_events" className="text-lg" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors">
                          {lb.name}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {isCompleted ? 'Ended' : 'Active'}
                          {lb.expiryDate && ` · ${new Date(lb.expiryDate).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <Icon
                      name="arrow_forward"
                      className="text-base text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Members */}
        <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 shadow-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white">Members</h2>
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
              {club._count.members}
            </span>
          </div>

          {club.members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                <Icon name="people" className="text-xl text-gray-400 dark:text-gray-500" />
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
                    <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                      <Icon name="person" className="text-lg text-gray-400 dark:text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Member
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
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
      </div>

      <ClubModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        type="edit"
        data={{
          name: club.name,
          slug: club.slug,
          description: club.description,
          isPublic: club.isPublic,
          isActive: club.isActive,
        }}
      />
    </div>
  );
};
