'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Search, Clock, ArrowRight } from 'lucide-react';
import SearchBar from '@/components/ui/SearchBar';
import { formatDate } from '@/utils/dateFormatter';
import { calculateReadingTime } from '@/utils/readingTime';

interface SearchResult {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
  created_at: string;
  content: string;
  category?: { name: string; slug: string } | null;
}

function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const performSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/posts?search=${encodeURIComponent(q)}&limit=20`);
      const data = await res.json();
      setResults(data.data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  const handleSearch = (q: string) => {
    setQuery(q);
    router.replace(`/search?q=${encodeURIComponent(q)}`);
    performSearch(q);
  };

  return (
    <main className="container mx-auto px-6 py-12">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-text-primary">Arama</h1>
          <p className="text-text-secondary">
            Blog yazıları arasında arama yapın.
          </p>
        </header>

        {/* Search Bar */}
        <div className="mb-10">
          <SearchBar
            initialQuery={initialQuery}
            placeholder="Yazı başlığı, içerik veya kategori..."
            autoFocus={!initialQuery}
            onSearch={handleSearch}
          />
        </div>

        {/* Results */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-surface" />
            ))}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="py-16 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-text-tertiary" />
            <h2 className="mb-2 text-xl font-semibold text-text-primary">Sonuç bulunamadı</h2>
            <p className="mb-6 text-text-secondary">
              <strong className="text-text-primary">&quot;{query}&quot;</strong> için sonuç bulunamadı.
              Farklı bir arama terimi deneyin.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-text-tertiary">
              <span>Öneri:</span>
              <span>Daha kısa kelimeler kullanın</span>
              <span>·</span>
              <span>Yazım hatası olabilir</span>
              <span>·</span>
              <span>Farklı bir konu deneyin</span>
            </div>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div>
            <p className="mb-6 text-sm text-text-tertiary">
              <strong className="text-text-primary">{results.length}</strong> sonuç bulundu
              {query && (
                <> — <span className="text-primary">&quot;{query}&quot;</span></>
              )}
            </p>

            <div className="space-y-4">
              {results.map((result) => {
                const readTime = calculateReadingTime(result.content);
                const titleHtml = highlightText(result.title, query);
                const excerptHtml = result.excerpt
                  ? highlightText(result.excerpt, query)
                  : '';

                return (
                  <Link
                    key={result.id}
                    href={`/blog/${result.slug}`}
                    className="group block rounded-xl border border-border bg-surface p-6 transition-all hover:border-primary/30 hover:bg-surface-hover"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
                      {result.category && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                          {result.category.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {readTime} dk okuma
                      </span>
                      <span>{formatDate(result.published_at || result.created_at)}</span>
                    </div>

                    <h2
                      className="mb-2 text-lg font-bold text-text-primary transition-colors group-hover:text-primary [&_mark]:bg-primary/20 [&_mark]:text-primary [&_mark]:rounded"
                      dangerouslySetInnerHTML={{ __html: titleHtml }}
                    />

                    {excerptHtml && (
                      <p
                        className="line-clamp-2 text-sm text-text-secondary [&_mark]:bg-primary/20 [&_mark]:text-primary [&_mark]:rounded"
                        dangerouslySetInnerHTML={{ __html: excerptHtml }}
                      />
                    )}

                    <span className="mt-3 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Yazıyı Oku
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {!searched && !loading && (
          <div className="py-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-text-tertiary" />
            <p className="text-text-secondary">
              Aramak istediğiniz kelimeyi yukarıya yazın.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-6 py-24 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
        <p className="text-text-secondary">Arama sayfası yükleniyor...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
