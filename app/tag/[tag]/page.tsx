import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase/client';
import BlogCard from '@/components/ui/BlogCard';
import Pagination from '@/components/ui/Pagination';
import Sidebar from '@/components/ui/Sidebar';
import { calculateReadingTime } from '@/utils/readingTime';
import { formatDate } from '@/utils/dateFormatter';
import type { PostWithRelations } from '@/types';
import { Hash } from 'lucide-react';

export const revalidate = 3600;

const PER_PAGE = 12;

interface TagPageProps {
  params: { tag: string };
  searchParams: { page?: string };
}

export async function generateStaticParams() {
  const { data } = await supabase.from('tags').select('slug');
  return (data || []).map((t) => ({ tag: t.slug }));
}

export async function generateMetadata({ params }: { params: { tag: string } }): Promise<Metadata> {
  const { data: tag } = await supabase
    .from('tags')
    .select('name')
    .eq('slug', params.tag)
    .single();

  if (!tag) return {};

  return {
    title: `#${tag.name} Etiketi | Sefa Çam Blog`,
    description: `"${tag.name}" etiketiyle işaretlenmiş tüm yazılar.`,
    alternates: { canonical: `https://sefacam.com/tag/${params.tag}` },
  };
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const currentPage = parseInt(searchParams.page || '1', 10);
  const offset = (currentPage - 1) * PER_PAGE;

  const { data: tag } = await supabase
    .from('tags')
    .select('id, name, slug')
    .eq('slug', params.tag)
    .single();

  if (!tag) notFound();

  // Get post IDs for this tag
  const { data: postTagRows } = await supabase
    .from('post_tags')
    .select('post_id')
    .eq('tag_id', tag.id);

  const postIds = (postTagRows || []).map((r) => r.post_id);

  const [{ data: posts, count }, { data: popularPosts }, { data: categories }] =
    await Promise.all([
      postIds.length > 0
        ? supabase
            .from('posts')
            .select('*, author:authors(*), category:categories(*)', { count: 'exact' })
            .in('id', postIds)
            .eq('is_published', true)
            .order('published_at', { ascending: false })
            .range(offset, offset + PER_PAGE - 1)
        : Promise.resolve({ data: [], count: 0, error: null }),
      supabase
        .from('posts')
        .select('id, slug, title, view_count, featured_image_url, published_at, created_at')
        .eq('is_published', true)
        .order('view_count', { ascending: false })
        .limit(5),
      supabase.from('categories').select('id, name, slug').limit(15),
    ]);

  const totalPages = Math.ceil((count || 0) / PER_PAGE);

  return (
    <div className="container mx-auto px-6 py-12">
      <header className="mb-10">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Hash className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-text-primary">#{tag.name}</h1>
        </div>
        <p className="text-sm text-text-tertiary">{count || 0} yazı bulundu</p>
      </header>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px]">
        <main>
          {posts && posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {(posts as PostWithRelations[]).map((post) => (
                  <BlogCard
                    key={post.id}
                    slug={post.slug}
                    title={post.title}
                    excerpt={post.excerpt || ''}
                    featuredImage={post.featured_image_url || undefined}
                    category={post.category?.name || 'Genel'}
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
                    onPageChange={(page) => `/tag/${params.tag}?page=${page}`}
                    useLinks
                  />
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-border bg-surface p-16 text-center">
              <p className="text-text-secondary">Bu etiketle işaretlenmiş yazı bulunamadı.</p>
            </div>
          )}
        </main>

        <aside>
          <div className="sticky top-24">
            <Sidebar popularPosts={popularPosts || []} categories={categories || []} />
          </div>
        </aside>
      </div>
    </div>
  );
}
