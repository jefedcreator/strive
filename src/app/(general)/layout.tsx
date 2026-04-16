import { Provider } from '@/provider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Strive',
    default: 'Strive - The Ultimate Running Community & Competition Platform',
  },
  description:
    'Join the global running community. Compete on unified leaderboards, join private clubs, and push your limits across Strava and Nike Run Club.',
  openGraph: {
    title: 'Strive - The Ultimate Running Community & Competition Platform',
    description:
      'Join the global running community. Compete on unified leaderboards, join private clubs, and push your limits across Strava and Nike Run Club.',
    url: '/',
    siteName: 'Strive',
    images: [
      {
        url: '/banner.png',
        width: 1200,
        height: 1200,
        alt: 'Strive - The Ultimate Running Community & Competition Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Strive - The Ultimate Running Community & Competition Platform',
    description:
      'Join the global running community. Compete on unified leaderboards, join private clubs, and push your limits across Strava and Nike Run Club.',
    images: ['/banner.png'],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || 'https://usestrive.run',
  },
};

export default function GeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider>
      <div className="relative min-h-screen transition-colors duration-300 overflow-x-hidden">
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
        {children}
      </div>
    </Provider>
  );
}
