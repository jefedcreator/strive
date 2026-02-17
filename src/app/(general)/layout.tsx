import { Provider } from '@/provider';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Strive - Sync Your Fitness Journey',
  description:
    'A high-performance fitness platform that synchronizes your journey across Strava and Nike Run Club.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-display bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-100 min-h-screen transition-colors duration-300 relative  overflow-x-hidden`}
      >
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none select-none">
          <svg
            className="absolute top-10 left-10 w-64 h-64 text-gray-900 dark:text-gray-100 bg-pattern-item"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M13 10V3L4 14h7v7l9-11h-7z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="0.5"
            />
          </svg>
          <svg
            className="absolute bottom-20 right-20 w-96 h-96 text-gray-900 dark:text-gray-100 bg-pattern-item"
            fill="none"
            stroke="currentColor"
            style={{ animationDelay: '2s' }}
            viewBox="0 0 24 24"
          >
            <path
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="0.2"
            />
          </svg>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-primary rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        </div>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
