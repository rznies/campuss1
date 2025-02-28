import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// Simple in-memory cache
const cache: Record<string, CacheItem<any>> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useDataFetching<T>(
  fetchFn: () => Promise<T>,
  cacheKey?: string,
  dependencies: any[] = [],
  cacheDuration: number = CACHE_DURATION
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (forceFresh: boolean = false) => {
    // ... existing code ...
  }, [fetchFn, cacheKey, cacheDuration]);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [...dependencies]);

  return { data, isLoading, error, refetch: fetchData };
} 