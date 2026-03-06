import { Sidebar } from '@/components/sidebar';
import { TooltipProvider } from '@/components/tooltip';
import { TopNav } from '@/components/top-nav';
import { Provider } from '@/provider';
import { getRuns } from '@/server';
import '@/styles/globals.css';
import { type Metadata, type Viewport } from 'next';
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://usestrive.run'
  ),
  title: {
    template: '%s | Strive',
    default: 'Strive Dashboard',
  },
  description:
    'A high-performance fitness platform that synchronizes your journey across Strava and Nike Run Club.',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Strive Dashboard',
    description:
      'A high-performance fitness platform that synchronizes your journey across Strava and Nike Run Club.',
    url: '/home',
    siteName: 'Strive',
    images: [
      {
        url: '/banner.png',
        width: 1200,
        height: 1200,
        alt: 'Strive Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Strive Dashboard',
    description:
      'A high-performance fitness platform that synchronizes your journey across Strava and Nike Run Club.',
    images: ['/banner.png'],
  },
  appleWebApp: {
    title: 'Strive',
    capable: true,
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data } = await getRuns();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="bg-background-light dark:bg-background-dark min-h-[100dvh]"
    >
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html { min-height: 100dvh; background-color: #F7F9FB; }
              body { min-height: 100dvh; background-color: #F7F9FB; }
              @media (prefers-color-scheme: dark) {
                html, body { background-color: #0B0F19; }
              }
              html.dark, html.dark body { background-color: #0B0F19; }
            `,
          }}
        />
      </head>
      <body className="font-display bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-100 min-h-[100dvh] transition-colors duration-300 relative overflow-x-hidden antialiased">
        <NextTopLoader showSpinner={false} color="#ff014e" />
        <Provider data={data}>
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
      </body>
    </html>
  );
}
