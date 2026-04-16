import { Sidebar } from '@/components/sidebar';
import { TooltipProvider } from '@/components/tooltip';
import { TopNav } from '@/components/top-nav';
import { Provider } from '@/provider';
import { getRuns } from '@/server';
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';
import { type Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    template: '%s | Strive',
    default: 'Strive Dashboard - Your Competitions and Clubs',
  },
  description:
    'Track your rank, manage your running clubs, and analyze your competitive performance.',
  openGraph: {
    title: 'Strive Dashboard - Your Competitions and Clubs',
    description:
      'Track your rank, manage your running clubs, and analyze your competitive performance.',
    url: '/home',
    siteName: 'Strive',
    images: [
      {
        url: '/banner.png',
        width: 1200,
        height: 1200,
        alt: 'Strive Dashboard - Your Competitions and Clubs',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Strive Dashboard - Your Competitions and Clubs',
    description:
      'Track your rank, manage your running clubs, and analyze your competitive performance.',
    images: ['/banner.png'],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'https://usestrive.run'}/home`,
  },
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data } = await getRuns();

  return (
    <Provider data={data}>
      <NextTopLoader showSpinner={false} color="#ff014e" />
      <TooltipProvider delayDuration={0}>
        <div className="flex min-h-[100dvh]">
          <Sidebar />
          <div className="flex-1 flex flex-col lg:pt-0">
            <TopNav />
            <div className="container mx-auto max-w-7xl px-4 py-6 md:p-6">
              <main className="w-full">{children}</main>
            </div>
          </div>
        </div>
      </TooltipProvider>
      <Toaster richColors position="top-center" closeButton />
    </Provider>
  );
}
