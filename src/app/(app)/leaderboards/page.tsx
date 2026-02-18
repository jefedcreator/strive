'use client';

import React, { useState } from 'react';
import { type User, type UserType } from '@prisma/client';
import { LeaderboardCard, type LeaderboardWithRelations, Icon } from '@/components/leaderboard-card';
import { CreateLeaderboardModal } from '@/components/leaderboard-modal';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { type CustomApiResponse } from '@/types';

// Mock Data as fallback
const MOCK_USERS: User[] = [
  {
    id: 'u1',
    fullname: 'James Miller',
    email: 'james@example.com',
    avatar: 'https://i.pravatar.cc/150?u=u1',
    type: 'STRAVA' as UserType,
    username: 'jamesm',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
    access_token: null,
  },
  {
    id: 'u2',
    fullname: 'Sarah Jenkins',
    email: 'sarah@example.com',
    avatar: 'https://i.pravatar.cc/150?u=u2',
    type: 'NRC' as UserType,
    username: 'sarahj',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
    access_token: null,
  },
  {
    id: 'u3',
    fullname: 'Mike K.',
    email: 'mike@example.com',
    avatar: null,
    type: 'STRAVA' as UserType,
    username: 'mikek',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
    access_token: null,
  },
];

const MOCK_LEADERBOARDS: LeaderboardWithRelations[] = [
  {
    id: 'l1',
    name: 'Winter 10k Challenge',
    description: 'A friendly competition for the NYC Runners club to keep moving during the winter months.',
    isActive: true,
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12),
    createdById: 'u1',
    clubId: 'c1',
    club: {
      id: 'c1',
      name: 'NYC Runners Club',
      slug: 'nyc-runners',
      description: 'NYC Runners',
      image: null,
      isActive: true,
      isPublic: true,
      memberCount: 150,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: 'u1',
    },
    entries: [
      { id: 'e1', userId: 'u1', leaderboardId: 'l1', score: 120, createdAt: new Date(), updatedAt: new Date(), lastScoreDate: new Date(), isActive: true, user: MOCK_USERS[0]! },
      { id: 'e2', userId: 'u2', leaderboardId: 'l1', score: 110, createdAt: new Date(), updatedAt: new Date(), lastScoreDate: new Date(), isActive: true, user: MOCK_USERS[1]! },
      { id: 'e3', userId: 'u3', leaderboardId: 'l1', score: 95, createdAt: new Date(), updatedAt: new Date(), lastScoreDate: new Date(), isActive: true, user: MOCK_USERS[2]! },
    ],
  },
];

interface Activity {
    id: string;
    user: Partial<User>;
    leaderboardTitle: string;
    action: string;
    time: string;
}

const ActivityTable: React.FC<{ activities: Activity[] }> = ({ activities }) => (
    <div className="mt-12 bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-soft">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white">Recent Activity</h3>
            <button className="text-xs font-semibold text-primary dark:text-white hover:underline">View All</button>
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

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState('All Active');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: leaderboardsResponse, isLoading } = useQuery<CustomApiResponse<LeaderboardWithRelations[]>>({
    queryKey: ['leaderboards'],
    queryFn: async () => {
      const res = await axios.get('/api/leaderboards');
      return res.data;
    },
  });

  const leaderboards = leaderboardsResponse?.data || MOCK_LEADERBOARDS;

  const recentActivities: Activity[] = [
    {
      id: 'a1',
      user: MOCK_USERS[0]!,
      leaderboardTitle: 'Winter 10k Challenge',
      action: '+1 New Record',
      time: '2 mins ago',
    },
    {
      id: 'a2',
      user: MOCK_USERS[1]!,
      leaderboardTitle: 'Alpine Trail Seekers',
      action: 'Joined',
      time: '1 hour ago',
    },
  ];

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
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-primary px-5 py-2.5 rounded-lg text-sm font-bold flex items-center shadow-soft transition-all w-full sm:w-auto justify-center"
          >
            <Icon name="add" className="text-sm mr-2" />
            Create Leaderboard
          </button>
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

export default LeaderboardPage;
