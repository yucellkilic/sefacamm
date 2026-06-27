'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, TrendingUp, Tag, Mail, Youtube, Instagram } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface PopularPost {
  id: string;
  slug: string;
  title: string;
  view_count: number;
  featured_image_url?: string | null;
  published_at?: string | null;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: number;
}

interface SidebarProps {
  popularPosts?: PopularPost[];
  categories?: Category[];
}

export default function Sidebar({ popularPosts = [], categories = [] }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setNewsletterStatus('loading');
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setNewsletterStatus('success');
        setEmail('');
      } else {
        setNewsletterStatus('error');
      }
    } catch {
      setNewsletterStatus('error');
    }
  };

  return (
    <aside className="space-y-8" aria-label="Yan panel">
      {/* Search */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
          <Search className="h-5 w-5 text-primary" />
          Ara
        </h3>
        <form onSubmit={handleSearch} role="search">
          <div className="flex gap-2">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Blog'da ara..."
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm text-text-primary placeholder-text-tertiary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              aria-label="Blog'da ara"
            />
            <button
              type="submit"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-background transition-colors hover:bg-primary-hover"
              aria-label="Aramayı başlat"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Popular Posts */}
      {popularPosts.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
            <TrendingUp className="h-5 w-5 text-primary" />
            Popüler Yazılar
          </h3>
          <ul className="space-y-4">
            {popularPosts.map((post, index) => (
              <motion.li
                key={post.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex items-start gap-3"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <span className="text-sm text-text-secondary transition-colors group-hover:text-primary line-clamp-2">
                    {post.title}
                  </span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
            <Tag className="h-5 w-5 text-primary" />
            Kategoriler
          </h3>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/category/${category.slug}`}
                  className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-text-secondary transition-all hover:bg-surface-hover hover:text-primary"
                >
                  <span>{category.name}</span>
                  {category._count !== undefined && (
                    <span className="rounded-full bg-surface-hover px-2 py-0.5 text-xs text-text-tertiary group-hover:bg-primary/10 group-hover:text-primary">
                      {category._count}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Social Channels */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="mb-4 text-lg font-semibold text-text-primary">Sosyal Medya</h3>
        <div className="space-y-3">
          <a
            href="https://www.youtube.com/@sefacamm?si=0-ZsgvpVhYqgEX12"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 transition-all hover:border-red-500/40 hover:bg-red-500/10"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500">
              <Youtube className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-text-primary">YouTube</div>
              <div className="truncate text-xs text-text-secondary">@sefacamm</div>
            </div>
          </a>
          <a
            href="https://www.instagram.com/kimbusefa34?igsh=MTBkaWk0YjhnOWxuaQ%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl border border-pink-500/20 bg-pink-500/5 px-4 py-3 transition-all hover:border-pink-500/40 hover:bg-pink-500/10"
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{
                background:
                  'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
              }}
            >
              <Instagram className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-text-primary">Instagram</div>
              <div className="truncate text-xs text-text-secondary">@kimbusefa34</div>
            </div>
          </a>
        </div>
      </div>

      {/* Newsletter */}
      <div className="rounded-xl border border-primary/30 bg-surface p-6 shadow-glow">
        <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-text-primary">
          <Mail className="h-5 w-5 text-primary" />
          Bülten
        </h3>
        <p className="mb-4 text-sm text-text-secondary">
          Yeni yazılardan haberdar olmak için abone ol.
        </p>

        {newsletterStatus === 'success' ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-medium text-success"
          >
            ✅ Başarıyla abone oldunuz!
          </motion.p>
        ) : (
          <form onSubmit={handleNewsletter}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta adresiniz"
              required
              className="mb-3 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-text-primary placeholder-text-tertiary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              aria-label="E-posta adresi"
            />
            <button
              type="submit"
              disabled={newsletterStatus === 'loading'}
              className="w-full rounded-lg bg-primary py-2 text-sm font-semibold text-background transition-all hover:bg-primary-hover disabled:opacity-50"
            >
              {newsletterStatus === 'loading' ? 'Kaydediliyor...' : 'Abone Ol'}
            </button>
            {newsletterStatus === 'error' && (
              <p className="mt-2 text-xs text-error">
                Bir hata oluştu. Lütfen tekrar deneyin.
              </p>
            )}
          </form>
        )}
      </div>
    </aside>
  );
}
