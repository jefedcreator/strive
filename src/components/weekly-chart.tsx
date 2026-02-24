'use client';

import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTheme } from 'next-themes';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function WeeklyChart() {
  const { theme } = useTheme();

  const chartData = useMemo(() => {
    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    const barColor = isDark ? '#FFFFFF' : '#111111';

    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Distance (km)',
          data: [5.2, 0, 7.1, 4.5, 0, 12.3, 5.0],
          backgroundColor: barColor,
          borderRadius: 4,
          barThickness: 24,
        },
      ],
    };
  }, [theme]);

  const chartOptions = useMemo(() => {
    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    const gridColor = isDark ? '#333333' : '#f3f4f6';
    const textColor = isDark ? '#9ca3af' : '#6b7280';

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: gridColor,
            drawBorder: false,
          },
          ticks: {
            color: textColor,
            font: {
              family: "'Inter', sans-serif",
              size: 11,
            },
          },
        },
        x: {
          grid: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            color: textColor,
          },
        },
      },
    };
  }, [theme]);

  return (
    <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Weekly Progress
        </h3>
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button className="px-3 py-1 bg-white dark:bg-gray-700 text-xs font-medium rounded-md shadow-sm text-gray-900 dark:text-white">
            Distance
          </button>
          <button className="px-3 py-1 text-xs font-medium rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            Time
          </button>
        </div>
      </div>
      <div className="h-64 w-full">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
