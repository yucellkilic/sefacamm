'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import type { PostWithRelations } from '@/types';

interface UseSearchResponse {
  query: string;
  setQuery: (q: string) => void;
  results: PostWithRelations[];
  isLoading: boolean;
  error: any;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function useSearch(initialQuery = ''): UseSearchResponse {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  const key = debouncedQuery.trim()
    ? `/api/posts?search=${encodeURIComponent(debouncedQuery)}&limit=20`
    : null;

  const { data, error, isLoading } = useSWR(key, fetcher);

  return {
    query,
    setQuery,
    results: data?.data || [],
    isLoading: !!key && isLoading,
    error,
  };
}
