import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-4',
};

export const Loader: React.FC<LoaderProps> = ({ size = 'md', className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeMap[size]} rounded-full border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-white animate-spin`}
      />
    </div>
  );
};

export const PageLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-[3px] border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-white animate-spin" />
        <p className="text-sm font-medium text-gray-400 dark:text-gray-500 animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
};
