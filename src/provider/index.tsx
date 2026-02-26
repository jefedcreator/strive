'use client';
import { MetaThemeColorMeta } from '@/components/meta-theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import type { ReactNode } from 'react';
import { StoreProvider } from './store-provider';
import type { RunData } from '@/types';

interface QueryProviderProps {
  children: ReactNode;
  data?: RunData[];
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 5000,
      refetchOnMount: 'always',
      refetchOnWindowFocus: 'always',
    },
  },
});

function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export const Provider = ({ children, data }: QueryProviderProps) => {
  // useViewportHandler();

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MetaThemeColorMeta />
          <NuqsAdapter>
            {/* <SocketProvider> */}
            <StoreProvider initialRuns={data ?? []}>
              {children}
              {/* </SocketProvider> */}
            </StoreProvider>
          </NuqsAdapter>
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
};
