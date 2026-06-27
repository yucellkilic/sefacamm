'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  initialQuery?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
}

export default function SearchBar({
  initialQuery = '',
  placeholder = 'Blog\'da ara...',
  autoFocus = false,
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      if (onSearch) {
        onSearch(trimmed);
      } else {
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      }
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="relative">
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-5 w-5 text-text-tertiary pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="h-12 w-full rounded-xl border border-border bg-surface pl-11 pr-12 text-text-primary placeholder-text-tertiary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          aria-label="Arama"
        />

        <AnimatePresence>
          {query && (
            <motion.button
              type="button"
              onClick={handleClear}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-4 text-text-tertiary transition-colors hover:text-text-primary"
              aria-label="Aramayı temizle"
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
