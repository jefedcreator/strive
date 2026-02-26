import { useEffect } from 'react';
import { useInfiniteQuery, type QueryKey } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import type { PaginatedApiResponse } from '@/types';

interface UsePaginationScrollProps<T> {
  queryKey: QueryKey;
  fetchData: (page: number) => Promise<PaginatedApiResponse<T[]>>;
  page: number;
  setPage: (page: number) => void;
  initialData?: PaginatedApiResponse<T[]>;
  isNavigating: boolean;
}

export function usePaginationScroll<T>({
  queryKey,
  fetchData,
  page,
  setPage,
  initialData,
  isNavigating,
}: UsePaginationScrollProps<T>) {
  const queryFn = async ({ pageParam = 1 }) => {
    setPage(pageParam);
    return await fetchData(pageParam);
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey,
    queryFn,
    initialPageParam: page,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialData:
      !isNavigating && initialData
        ? { pages: [initialData], pageParams: [page] }
        : undefined,
  });

  // Flatten the generic pages into a single generic array of items
  const items = data?.pages.flatMap((pageData) => pageData.data) ?? [];

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    items, // Returns T[]
    ref,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  };
}
