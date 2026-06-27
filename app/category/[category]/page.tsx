import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase/client';
import BlogCard from '@/components/ui/BlogCard';
import Pagination from '@/components/ui/Pagination';
import Sidebar from '@/components/ui/Sidebar';
import { calculateReadingTime } from '@/utils/readingTime';
import { formatDate } from '@/utils/dateFormatter';
import type { PostWithRelations } from '@/types';
import { Tag } from 'lucide-react';

export const revalidate = 3600;

const PER_PAGE = 12;

interface CategoryPageProps {
  params: { category: string };
  searchParams: { page?: string };
}

export async function generateStaticParams() {
  const { data } = await supabase.from('categories').select('slug');
  return (data || []).map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', params.category)
    .single();

  if (!category) return {};

  const title = `${category.name} Yazıları | Sefa Çam Blog`;
  const description = category.description || `${category.name} kategorisindeki tüm yazılar.`;

  return {
    title,
    description,
    openGraph: { title, description, url: `https://sefacam.com/category/${params.category}` },
    alternates: { canonical: `https://sefacam.com/category/${params.category}` },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const currentPage = parseInt(searchParams.page || '1', 10);
  const offset = (currentPage - 1) * PER_PAGE;

  const { data: category } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .eq('slug', params.category)
    .single();

  if (!category) notFound();

  const [
    { data: posts, count },
    { data: popularPosts },
    { data: allCategories },
  ] = await Promise.all([
    supabase
      .from('posts')
      .select('*, author:authors(*), category:categories(*)', { count: 'exact' })
      .eq('category_id', category.id)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .range(offset, offset + PER_PAGE - 1),
    supabase
      .from('posts')
      .select('id, slug, title, view_count, featured_image_url, published_at, created_at')
      .eq('is_published', true)
      .order('view_count', { ascending: false })
      .limit(5),
    supabase.from('categories').select('id, name, slug').limit(15),
  ]);

  const totalPages = Math.ceil((count || 0) / PER_PAGE);
  const categoryPosts = (posts || []) as PostWithRelations[];

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Header */}
      <header className="mb-10">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Tag className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-text-primary">{category.name}</h1>
        </div>
        {category.description && (
          <p className="max-w-2xl text-text-secondary">{category.description}</p>
        )}
        <p className="mt-2 text-sm text-text-tertiary">
          {count || 0} yazı bulundu
        </p>
      </header>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px]">
        <main>
          {categoryPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categoryPosts.map((post) => (
                  <BlogCard
                    key={post.id}
                    slug={post.slug}
                    title={post.title}
                    excerpt={post.excerpt || ''}
                    featuredImage={post.featured_image_url || undefined}
                    category={post.category?.name || category.name}
                    author={{
                      name: post.author?.name || 'Sefa Çam',
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
                    onPageChange={(page) => `/category/${params.category}?page=${page}`}
                    useLinks
                  />
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-border bg-surface p-16 text-center">
              <p className="text-text-secondary">Bu kategoride henüz yazı yok.</p>
            </div>
          )}
        </main>

        <aside>
          <div className="sticky top-24">
            <Sidebar popularPosts={popularPosts || []} categories={allCategories || []} />
          </div>
        </aside>
      </div>
    </div>
  );
}
