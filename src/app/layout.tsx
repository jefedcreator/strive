import '@/styles/globals.css';
import { type Metadata, type Viewport } from 'next';
import Script from 'next/script';
import { ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://usestrive.run'
  ),
  title: {
    template: '%s | Strive',
    default: 'Strive - The Ultimate Running Community & Competition Platform',
  },
  description:
    'Join the global running community. Compete on unified leaderboards, join private clubs, and push your limits across Strava and Nike Run Club.',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
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
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-2WELML36XG`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
           gtag('config', 'G-2WELML36XG');
          `}
        </Script>
      </head>
      <body className="font-display bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-100 min-h-[100dvh] transition-colors duration-300 relative overflow-x-hidden antialiased flex flex-col">
        <div className="flex-1 shrink-0 flex flex-col">{children}</div>
        
        <div className="w-full shrink-0 border-t border-gray-100 dark:border-white/5 py-8 mt-auto z-10 relative bg-white dark:bg-[#06080D]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              © {new Date().getFullYear()} Strive Platforms Inc. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                className="text-xs font-semibold text-gray-400 hover:text-primary transition-colors inline-flex items-center gap-1.5"
                href="https://jefedcreator.cv/"
                target="_blank"
                rel="noreferrer"
              >
                Built with love by James ❤️
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                System Operational
              </span>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
