'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, ArrowUpRight } from 'lucide-react';
import Badge from './Badge';
import Avatar from './Avatar';
import { cn } from '@/lib/utils';

export interface BlogCardProps {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage?: string;
  category: string;
  author: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  readTime?: number;
  className?: string;
}

export default function BlogCard({
  slug,
  title,
  excerpt,
  featuredImage,
  category,
  author,
  publishedAt,
  readTime,
  className,
}: BlogCardProps) {
  const [imgError, setImgError] = useState(false);
  return (
    <motion.article
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border bg-surface transition-all',
        className
      )}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, borderColor: 'rgba(255,215,0,0.3)' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      role="article"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
    >
      {/* Glow on hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
        style={{
          background:
            'radial-gradient(circle at top right, rgba(255,215,0,0.06) 0%, transparent 60%)',
        }}
      />

      <Link href={`/blog/${slug}`} className="block">
        {/* Image */}
        <div className="relative h-48 overflow-hidden rounded-t-2xl">
          {featuredImage && !imgError ? (
            <>
              <Image
                src={featuredImage}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={() => setImgError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
            </>
          ) : (
            <div
              className="h-full w-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255,215,0,0.05) 0%, rgba(26,26,26,1) 100%)',
              }}
            >
              <div className="text-4xl opacity-20">✍️</div>
            </div>
          )}

          {/* Category badge */}
          <div className="absolute left-4 top-4">
            <Badge variant="primary">{category}</Badge>
          </div>

          {/* Arrow icon — appears on hover */}
          <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/90 text-background">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="mb-2.5 line-clamp-2 text-lg font-bold text-text-primary transition-colors duration-200 group-hover:text-primary leading-snug">
            {title}
          </h3>
          <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-text-secondary">{excerpt}</p>

          {/* Meta */}
          <div className="flex items-center justify-between border-t border-border/50 pt-4">
            <div className="flex items-center gap-2">
              <Avatar src={author.avatar} alt={author.name} size="sm" />
              <span className="text-xs font-medium text-text-secondary">{author.name}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-text-tertiary">
              <span>{publishedAt}</span>
              {readTime && (
                <span className="flex items-center gap-1 rounded-full bg-surface-hover px-2 py-0.5">
                  <Clock className="h-3 w-3" />
                  {readTime} dk
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
