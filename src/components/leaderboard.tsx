interface LeaderboardEnty {
  rank: number;
  initials: string;
  name: string;
  distance: string;
  pace: string;
  isUser?: boolean;
  avatarColor: string; // "indigo", "pink", "teal", "purple", "gray"
}

const leaderboardData: LeaderboardEnty[] = [
  {
    rank: 1,
    initials: 'JM',
    name: 'James Miller',
    distance: '84.5 km',
    pace: '4\'45" /km',
    avatarColor: 'indigo',
  },
  {
    rank: 2,
    initials: 'SJ',
    name: 'Sarah Jenkins',
    distance: '72.1 km',
    pace: '5\'02" /km',
    avatarColor: 'pink',
  },
  {
    rank: 3,
    initials: 'R',
    name: 'You',
    distance: '68.4 km',
    pace: '5\'10" /km',
    isUser: true,
    avatarColor: 'gray',
  },
  {
    rank: 4,
    initials: 'MK',
    name: 'Mike K.',
    distance: '65.0 km',
    pace: '5\'22" /km',
    avatarColor: 'teal',
  },
  {
    rank: 5,
    initials: 'AL',
    name: 'Anna Lee',
    distance: '61.8 km',
    pace: '5\'15" /km',
    avatarColor: 'purple',
  },
];

export function Leaderboard() {
  const getAvatarColorClasses = (color: string) => {
    switch (color) {
      case 'indigo':
        return 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300';
      case 'pink':
        return 'bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300';
      case 'teal':
        return 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300';
      case 'purple':
        return 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300';
      case 'gray':
        return 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white border border-border-light dark:border-border-dark';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600';
    }
  };

  const getRankBadge = (rank: number) => {
    let classes =
      'flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold';
    if (rank === 1)
      classes +=
        ' bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    else if (rank === 2)
      classes +=
        ' bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    else if (rank === 3)
      classes +=
        ' bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    else classes += ' text-center font-medium bg-transparent'; // For 4, 5 just text

    if (rank > 3)
      return <div className="text-center text-xs font-medium">{rank}</div>;
    return <div className={classes}>{rank}</div>;
  };

  return (
    <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Leaderboard Overview
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Top performers in The Runners Club (This Week)
          </p>
        </div>
        <button className="text-sm text-primary-custom dark:text-white font-medium hover:underline">
          View Full Leaderboard
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="bg-gray-50 dark:bg-white/5 text-xs uppercase text-gray-700 dark:text-gray-300">
            <tr>
              <th
                className="px-6 py-3 font-semibold tracking-wider"
                scope="col"
              >
                Rank
              </th>
              <th
                className="px-6 py-3 font-semibold tracking-wider"
                scope="col"
              >
                Athlete
              </th>
              <th
                className="px-6 py-3 font-semibold tracking-wider text-right"
                scope="col"
              >
                Distance
              </th>
              <th
                className="px-6 py-3 font-semibold tracking-wider text-right"
                scope="col"
              >
                Avg Pace
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {leaderboardData.map((entry) => (
              <tr
                key={entry.rank}
                className={`transition-colors ${
                  entry.isUser
                    ? 'bg-indigo-50/50 dark:bg-indigo-900/20 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border-l-4 border-indigo-500'
                    : 'bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRankBadge(entry.rank)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${getAvatarColorClasses(entry.avatarColor)}`}
                    >
                      {entry.initials}
                    </div>
                    <div
                      className={`font-medium ${entry.isUser ? 'font-bold' : ''} text-gray-900 dark:text-white`}
                    >
                      {entry.name}
                    </div>
                  </div>
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-right ${entry.isUser ? 'font-bold' : 'font-medium'} text-gray-900 dark:text-white`}
                >
                  {entry.distance}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {entry.pace}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
