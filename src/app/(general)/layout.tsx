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
        className={`${inter.variable} font-display bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-100 min-h-screen transition-colors duration-300`}
      >
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
