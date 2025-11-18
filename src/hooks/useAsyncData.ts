/**
 * Production-grade async data fetching hook
 * Handles loading, error, and success states with proper cleanup
 * Similar to React Query but lightweight
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAsyncDataOptions<T> {
  // The async function to fetch data
  fetchFn: () => Promise<T>;

  // Dependencies that trigger a refetch
  dependencies?: any[];

  // Whether to fetch immediately on mount
  fetchOnMount?: boolean;

  // Timeout in milliseconds (default: 30000)
  timeout?: number;

  // Retry configuration
  retry?: {
    maxAttempts?: number;
    delay?: number;
  };

  // Cache key for storing data
  cacheKey?: string;

  // Enable caching
  enableCache?: boolean;

  // Callback when data is loaded
  onSuccess?: (data: T) => void;

  // Callback when error occurs
  onError?: (error: Error) => void;
}

interface UseAsyncDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  reset: () => void;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useAsyncData<T>(
  options: UseAsyncDataOptions<T>
): UseAsyncDataResult<T> {
  const {
    fetchFn,
    dependencies = [],
    fetchOnMount = true,
    timeout = 30000,
    retry = { maxAttempts: 1, delay: 1000 },
    cacheKey,
    enableCache = false,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(fetchOnMount);
  const [error, setError] = useState<Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const retryCountRef = useRef<number>(0);

  const fetchData = useCallback(async () => {
    // Check cache first
    if (enableCache && cacheKey) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[useAsyncData] Cache hit for ${cacheKey}`);
        setData(cached.data);
        setLoading(false);
        return;
      }
    }

    // Abort any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    if (!isMountedRef.current) return;

    setLoading(true);
    setError(null);

    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }, timeout);

    try {
      const result = await fetchFn();

      clearTimeout(timeoutId);

      if (!isMountedRef.current) return;

      // Cache the result
      if (enableCache && cacheKey) {
        cache.set(cacheKey, { data: result, timestamp: Date.now() });
      }

      setData(result);
      setLoading(false);
      retryCountRef.current = 0;

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);

      if (!isMountedRef.current) return;

      // Don't set error if request was aborted
      if (err.name === 'AbortError') {
        console.log('[useAsyncData] Request aborted');
        return;
      }

      const error = err instanceof Error ? err : new Error(String(err));

      // Retry logic
      if (
        retry.maxAttempts &&
        retryCountRef.current < retry.maxAttempts - 1
      ) {
        retryCountRef.current++;
        console.log(
          `[useAsyncData] Retrying... Attempt ${retryCountRef.current + 1}/${retry.maxAttempts}`
        );

        setTimeout(() => {
          fetchData();
        }, retry.delay || 1000);

        return;
      }

      setError(error);
      setLoading(false);

      if (onError) {
        onError(error);
      }
    }
  }, [fetchFn, timeout, enableCache, cacheKey, onSuccess, onError, ...dependencies]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    retryCountRef.current = 0;

    if (cacheKey) {
      cache.delete(cacheKey);
    }
  }, [cacheKey]);

  const refetch = useCallback(async () => {
    reset();
    await fetchData();
  }, [fetchData, reset]);

  // Fetch on mount or when dependencies change
  useEffect(() => {
    if (fetchOnMount) {
      fetchData();
    }

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  // Update mounted ref on mount
  useEffect(() => {
    isMountedRef.current = true;
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    reset,
  };
}

// Utility to clear all cache
export function clearCache(key?: string) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

// Utility to get cache stats
export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}
