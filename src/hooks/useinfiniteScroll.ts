// hooks/use-infinite-scroll.ts
'use client';
import { useEffect, useState, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import type { PaginatedApiResponse } from '@/types';

interface UseInfiniteScrollProps<T extends { id: string | number }> {
  data: PaginatedApiResponse<T[]>;
  page: number;
  setPage: (page: number) => void;
  refresh?: number;
}

export function useInfiniteScroll<T extends { id: string | number }>({
  data,
  page,
  setPage,
  refresh = 0,
}: UseInfiniteScrollProps<T>) {
  const [allItems, setAllItems] = useState<T[]>(data.data);
  // Track which pages have been successfully integrated to avoid duplicate appends
  const processedPages = useRef<Set<number>>(new Set([data.page]));

  useEffect(() => {
    if (data.page === 1) {
      setAllItems(data.data);
      processedPages.current = new Set([1]);
    } else if (!processedPages.current.has(data.page)) {
      setAllItems((prev) => {
        // Use a Map to ensure unique items by ID during accumulation
        const itemsMap = new Map(prev.map((item) => [item.id, item]));
        data.data.forEach((item) => itemsMap.set(item.id, item));
        return Array.from(itemsMap.values());
      });
      processedPages.current.add(data.page);
    }
  }, [data.data, data.page, refresh]);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  const hasNextPage = page < data.totalPages;

  useEffect(() => {
    // Only increment the page if:
    // 1. The sentinel is in view
    // 2. There are more pages to fetch
    // 3. The current state page matches the data we just received (prevents runaway requests)
    if (inView && hasNextPage && page === data.page) {
      setPage(page + 1);
    }
  }, [inView, hasNextPage, page, setPage, data.page]);

  return { items: allItems, ref, hasNextPage };
}
