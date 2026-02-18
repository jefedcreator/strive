'use client';

import React, { useState } from 'react';
import { LeaderboardCard, Icon } from '@/components/leaderboard-card';
import { CreateLeaderboardModal } from '@/components/leaderboard-modal';
import { Button } from '@/primitives/Button';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { type PaginatedApiResponse, type LeaderboardListItem } from '@/types';
import { type User } from '@prisma/client';

const ActivityTable: React.FC<{ activities: Activity[] }> = ({ activities }) => (
    <div className="mt-12 bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-soft">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white">Recent Activity</h3>
            <Button variant="ghost" size="sm">View All</Button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3">Leaderboard</th>
                        <th className="px-6 py-3">Action</th>
                        <th className="px-6 py-3 text-right">Time</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {activities.map((activity) => (
                        <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                                    {activity.user.avatar ? (
                                        <img src={activity.user.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-xs text-gray-400">
                                            {activity.user.fullname?.[0]}
                                        </div>
                                    )}
                                </div>
                                <span className="font-medium text-gray-900 dark:text-white">{activity.user.fullname}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{activity.leaderboardTitle}</td>
                            <td className="px-6 py-4">
                                <span className="px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] font-bold uppercase">
                                    {activity.action}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right text-gray-500 dark:text-gray-400 text-xs">{activity.time}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

interface Activity {
    id: string;
    user: Partial<User>;
    leaderboardTitle: string;
    action: string;
    time: string;
}

interface LeaderboardsPageClientProps {
  initialData: PaginatedApiResponse<LeaderboardListItem[]>;
}

export const LeaderboardsPageClient: React.FC<LeaderboardsPageClientProps> = ({ initialData }) => {
  const [activeTab, setActiveTab] = useState('All Active');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: leaderboardsResponse } = useQuery<PaginatedApiResponse<LeaderboardListItem[]>>({
    queryKey: ['leaderboards'],
    queryFn: async () => {
      const res = await axios.get<PaginatedApiResponse<LeaderboardListItem[]>>('/api/leaderboards');
      return res.data;
    },
    initialData,
  });

  const leaderboards = leaderboardsResponse.data;

  const recentActivities: Activity[] = [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Leaderboards
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your competitions and track your progress across different
            clubs.
          </p>
        </div>
        <div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto"
          >
            <Icon name="add" className="text-sm mr-2" />
            Create Leaderboard
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-1 mb-8 border-b border-gray-200 dark:border-gray-800 overflow-x-auto scrollbar-hide">
        {['All Active', 'Pending', 'Completed', 'Invitations'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap relative ${
              activeTab === tab
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab}
            {tab === 'Invitations' && (
              <span className="ml-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-[10px] font-bold">
                2
              </span>
            )}
            {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-white" />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {leaderboards.map((board) => (
          <LeaderboardCard key={board.id} data={board} />
        ))}
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-50 dark:bg-white/5 rounded-2xl p-5 border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center hover:bg-white dark:hover:bg-gray-800/50 hover:border-primary dark:hover:border-gray-600 transition-all group min-h-[220px]"
        >
          <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-white mb-3 transition-colors">
            <Icon name="add" className="text-2xl" />
          </div>
          <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1">
            Create New Leaderboard
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px]">
            Start a new competition with friends or your club.
          </p>
        </button>
      </div>

      <ActivityTable activities={recentActivities} />

      <CreateLeaderboardModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
