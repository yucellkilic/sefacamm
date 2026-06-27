import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase/client';
import BlogCard from '@/components/ui/BlogCard';
import Pagination from '@/components/ui/Pagination';
import Sidebar from '@/components/ui/Sidebar';
import CategoryFilter from '@/components/ui/CategoryFilter';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { calculateReadingTime } from '@/utils/readingTime';
import { formatDate } from '@/utils/dateFormatter';
import type { PostWithRelations } from '@/types';
import { BookOpen } from 'lucide-react';

export const revalidate = 3600;

const POSTS_PER_PAGE = 12;

interface BlogPageProps {
  searchParams: { page?: string; category?: string };
}

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata(
    'Blog',
    'Teknoloji, yazılım ve web geliştirme üzerine güncel makaleler ve rehberler. Tüm yazıları keşfedin.',
    '/blog'
  );
}

async function getBlogData(page: number, categorySlug?: string) {
  const offset = (page - 1) * POSTS_PER_PAGE;

  let query = supabase
    .from('posts')
    .select('*, author:authors(*), category:categories(*)', { count: 'exact' })
    .eq('is_published', true);

  if (categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
    if (cat) query = query.eq('category_id', cat.id);
  }

  const { data: posts, count } = await query
    .order('published_at', { ascending: false })
    .range(offset, offset + POSTS_PER_PAGE - 1);

  const totalPages = Math.ceil((count || 0) / POSTS_PER_PAGE);

  return {
    posts: (posts || []) as PostWithRelations[],
    totalPages,
    total: count || 0,
  };
}

async function getSidebarData() {
  const [{ data: popularPosts }, { data: categories }] = await Promise.all([
    supabase
      .from('posts')
      .select('id, slug, title, view_count, featured_image_url, published_at, created_at')
      .eq('is_published', true)
      .order('view_count', { ascending: false })
      .limit(5),
    supabase.from('categories').select('id, name, slug').limit(15),
  ]);
  return { popularPosts: popularPosts || [], categories: categories || [] };
}

async function getAllCategories() {
  const { data } = await supabase.from('categories').select('id, name, slug').limit(20);
  return data || [];
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const currentPage = parseInt(searchParams.page || '1', 10);
  const categorySlug = searchParams.category;

  const [{ posts, totalPages, total }, { popularPosts, categories }, allCategories] =
    await Promise.all([
      getBlogData(currentPage, categorySlug),
      getSidebarData(),
      getAllCategories(),
    ]);

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Header */}
      <header className="mb-10">
        <div className="mb-2 flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-text-primary">Blog</h1>
        </div>
        <p className="text-text-secondary">
          {total > 0
            ? `${total} yazı bulundu${categorySlug ? ` — filtreli sonuçlar` : ''}`
            : 'Henüz yazı yayınlanmamış.'}
        </p>
      </header>

      {/* Category Filter */}
      {allCategories.length > 0 && (
        <div className="mb-8">
          <CategoryFilter categories={allCategories} activeCategory={categorySlug} />
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px]">
        {/* Posts */}
        <main>
          {posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <BlogCard
                    key={post.id}
                    slug={post.slug}
                    title={post.title}
                    excerpt={post.excerpt || ''}
                    featuredImage={post.featured_image_url || undefined}
                    category={post.category?.name || 'Genel'}
                    author={{
                      name: post.author?.name || 'Sefa Çam',
                      avatar: post.author?.avatar_url || undefined,
                    }}
                    publishedAt={formatDate(post.published_at || post.created_at)}
                    readTime={calculateReadingTime(post.content)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                      const params = new URLSearchParams();
                      params.set('page', String(page));
                      if (categorySlug) params.set('category', categorySlug);
                      return `/blog?${params.toString()}`;
                    }}
                    useLinks
                  />
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-border bg-surface p-16 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-text-tertiary" />
              <p className="mb-2 text-lg font-medium text-text-primary">Yazı bulunamadı</p>
              <p className="text-text-secondary">
                {categorySlug
                  ? 'Bu kategoride henüz yazı yok.'
                  : 'Henüz yayınlanmış yazı yok.'}
              </p>
              {categorySlug && (
                <Link
                  href="/blog"
                  className="mt-4 inline-block rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-background hover:bg-primary-hover"
                >
                  Tüm Yazılar
                </Link>
              )}
            </div>
          )}
        </main>

        {/* Sidebar */}
        <aside>
          <div className="sticky top-24">
            <Sidebar popularPosts={popularPosts} categories={categories} />
          </div>
        </aside>
      </div>
    </div>
  );
}
