import Link from 'next/link';

interface ActivityItem {
  id: string;
  clubInitials: string;
  clubName: string;
  clubColor: string; // e.g. "blue", "orange", "green"
  description: string;
  timeAgo: string;
}

const activities: ActivityItem[] = [
  {
    id: '1',
    clubInitials: 'TR',
    clubName: 'The Runners Club',
    clubColor: 'blue',
    description: 'Alex just finished a 10k run',
    timeAgo: '2 mins ago',
  },
  {
    id: '2',
    clubInitials: 'NRC',
    clubName: 'NRC Chicago',
    clubColor: 'orange',
    description: 'New challenge posted: "Winter Warrior"',
    timeAgo: '1 hour ago',
  },
  {
    id: '3',
    clubInitials: 'MT',
    clubName: 'Mountain Trail',
    clubColor: 'green',
    description: 'Sarah commented on your route.',
    timeAgo: '3 hours ago',
  },
];

export function ActivityList() {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'orange':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
      case 'green':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Club Activity
        </h3>
        <Link
          className="text-xs text-gray-500 hover:text-primary dark:hover:text-white"
          href="#"
        >
          View All
        </Link>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start space-x-3 pb-4 border-b border-border-light dark:border-border-dark last:border-0 last:pb-0"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getColorClasses(
                activity.clubColor
              )}`}
            >
              <span className="font-bold text-xs">{activity.clubInitials}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {activity.clubName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {activity.description}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                {activity.timeAgo}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
