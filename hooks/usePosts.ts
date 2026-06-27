'use client';

import useSWR from 'swr';
import type { PostWithRelations } from '@/types';

interface UsePostsOptions {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
  sort?: 'newest' | 'oldest' | 'popular';
}

interface UsePostsResponse {
  data: PostWithRelations[] | undefined;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | undefined;
  isLoading: boolean;
  error: any;
  mutate: () => Promise<any>;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function usePosts(options: UsePostsOptions = {}): UsePostsResponse {
  const { page = 1, limit = 12, category, tag, search, sort = 'newest' } = options;

  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  queryParams.append('sort', sort);

  if (category) queryParams.append('category', category);
  if (tag) queryParams.append('tag', tag);
  if (search) queryParams.append('search', search);

  const key = `/api/posts?${queryParams.toString()}`;
  const { data, error, isLoading, mutate } = useSWR(key, fetcher);

  return {
    data: data?.data,
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  };
}
