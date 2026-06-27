'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void | string;
  useLinks?: boolean;
}

export default function Pagination({ currentPage, totalPages, onPageChange, useLinks = false }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const visiblePages = pages.filter((page) => {
    if (totalPages <= 7) return true;
    if (page === 1 || page === totalPages) return true;
    if (page >= currentPage - 1 && page <= currentPage + 1) return true;
    return false;
  });

  const getHref = (page: number) => {
    if (useLinks) return onPageChange(page) as string;
    return undefined;
  };

  const handleClick = (page: number) => {
    if (!useLinks) (onPageChange as (p: number) => void)(page);
  };

  const PageItem = ({ page }: { page: number }) => {
    const isActive = currentPage === page;
    const href = getHref(page);
    const className = cn(
      'flex h-10 w-10 items-center justify-center rounded-md text-sm font-medium transition-all',
      isActive ? 'bg-primary text-background shadow-glow' : 'hover:bg-surface hover:text-primary text-text-secondary'
    );

    if (href) {
      return (
        <Link href={href} className={className} aria-label={`Sayfa ${page}`} aria-current={isActive ? 'page' : undefined}>
          {page}
        </Link>
      );
    }

    return (
      <motion.button
        onClick={() => handleClick(page)}
        className={className}
        whileHover={!isActive ? { scale: 1.1 } : {}}
        whileTap={!isActive ? { scale: 0.95 } : {}}
        aria-label={`Sayfa ${page}`}
        aria-current={isActive ? 'page' : undefined}
      >
        {page}
      </motion.button>
    );
  };

  const prevHref = getHref(currentPage - 1);
  const nextHref = getHref(currentPage + 1);

  return (
    <nav aria-label="Sayfalama" className="flex items-center justify-center gap-2">
      {prevHref && currentPage > 1 ? (
        <Link href={prevHref} className="flex h-10 w-10 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface hover:text-primary" aria-label="Önceki sayfa">
          <ChevronLeft className="h-5 w-5" />
        </Link>
      ) : (
        <motion.button
          onClick={() => currentPage > 1 && handleClick(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn('flex h-10 w-10 items-center justify-center rounded-md transition-colors', currentPage === 1 ? 'cursor-not-allowed text-text-tertiary' : 'hover:bg-surface hover:text-primary text-text-secondary')}
          whileHover={currentPage !== 1 ? { scale: 1.1 } : {}}
          aria-label="Önceki sayfa"
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>
      )}

      {visiblePages.map((page, index) => {
        const showEllipsis = index > 0 && page - visiblePages[index - 1] > 1;
        return (
          <div key={page} className="flex items-center gap-2">
            {showEllipsis && <span className="text-text-tertiary px-1">…</span>}
            <PageItem page={page} />
          </div>
        );
      })}

      {nextHref && currentPage < totalPages ? (
        <Link href={nextHref} className="flex h-10 w-10 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface hover:text-primary" aria-label="Sonraki sayfa">
          <ChevronRight className="h-5 w-5" />
        </Link>
      ) : (
        <motion.button
          onClick={() => currentPage < totalPages && handleClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn('flex h-10 w-10 items-center justify-center rounded-md transition-colors', currentPage === totalPages ? 'cursor-not-allowed text-text-tertiary' : 'hover:bg-surface hover:text-primary text-text-secondary')}
          whileHover={currentPage !== totalPages ? { scale: 1.1 } : {}}
          aria-label="Sonraki sayfa"
        >
          <ChevronRight className="h-5 w-5" />
        </motion.button>
      )}
    </nav>
  );
}
