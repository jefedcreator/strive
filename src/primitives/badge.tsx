import React from 'react';

export const StatusBadge = ({ status }: { status: boolean }) => {
  const styles = status
    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles}`}
    >
      {status ? 'Active' : 'Inactive'}
    </span>
  );
};

export const PrivacyBadge = ({ privacy }: { privacy: boolean }) => {
  const styles = privacy
    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles}`}
    >
      {privacy ? 'Public' : 'Private'}
    </span>
  );
};
