import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/lib/supabase/client';
import { generatePostMetadata } from '@/lib/seo/metadata';
import { generateBlogPostingSchema, generateBreadcrumbListSchema, generateFAQSchema } from '@/lib/seo/schemas';
import { calculateReadingTime } from '@/utils/readingTime';
import { formatDate } from '@/utils/dateFormatter';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import BlogCard from '@/components/ui/BlogCard';
import FAQ from '@/components/ui/FAQ';
import SocialShare from '@/components/ui/SocialShare';
import TOC from '@/components/ui/TOC';
import CommentForm from '@/components/ui/CommentForm';
import CommentList from '@/components/ui/CommentList';
import { Youtube, Instagram, Mail, Clock, Eye, Calendar, RefreshCw } from 'lucide-react';
import type { PostWithRelations, FAQItem } from '@/types';

export const revalidate = 3600;

async function getPost(slug: string) {
  const { data: post, error } = await supabase
    .from('posts')
    .select('*, author:authors(*), category:categories(*)')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !post) return null;

  // Get tags
  const { data: postTags } = await supabase
    .from('post_tags')
    .select('tag:tags(*)')
    .eq('post_id', post.id);

  const tags = postTags?.map((pt: any) => pt.tag) || [];

  // Get related posts
  let relatedQuery = supabase
    .from('posts')
    .select('*, author:authors(*), category:categories(*)')
    .eq('is_published', true)
    .neq('id', post.id)
    .limit(3);

  if (post.category_id) {
    relatedQuery = relatedQuery.eq('category_id', post.category_id);
  }

  const { data: relatedPosts } = await relatedQuery;

  // Increment view count (fire and forget)
  supabase
    .from('posts')
    .update({ view_count: (post.view_count || 0) + 1 })
    .eq('id', post.id)
    .then(() => {});

  return {
    post: { ...post, tags } as PostWithRelations & { tags: any[] },
    relatedPosts: (relatedPosts || []) as PostWithRelations[],
  };
}

export async function generateStaticParams() {
  const { data: posts } = await supabase
    .from('posts')
    .select('slug')
    .eq('is_published', true);
  return (posts || []).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getPost(params.slug);
  if (!data) return {};
  return generatePostMetadata(data.post, data.post.author ?? undefined);
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const data = await getPost(params.slug);

  if (!data) notFound();

  const { post, relatedPosts } = data;
  const readTime = calculateReadingTime(post.content);
  const socialLinks = (post.author?.social_links as any) || {};

  const postUrl = `https://sefacam.com/blog/${post.slug}`;
  const faqItems = (post.faq_schema as FAQItem[] | null) || [];
  const faqSchema = faqItems.length > 0 ? generateFAQSchema(faqItems) : null;
  const blogSchema = generateBlogPostingSchema(post, post.author ?? undefined);
  const breadcrumbSchema = generateBreadcrumbListSchema([
    { name: 'Ana Sayfa', url: 'https://sefacam.com/' },
    { name: 'Blog', url: 'https://sefacam.com/blog' },
    ...(post.category ? [{ name: post.category.name, url: `https://sefacam.com/category/${post.category.slug}` }] : []),
    { name: post.title, url: postUrl },
  ]);

  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <article className="container mx-auto px-6 py-12">
        {/* ─── Header ─── */}
        <header className="mx-auto mb-10 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-2 text-sm text-text-tertiary" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            {post.category && (
              <>
                <span>/</span>
                <Link href={`/category/${post.category.slug}`} className="hover:text-primary transition-colors">
                  {post.category.name}
                </Link>
              </>
            )}
          </nav>

          {/* Category + Read Time */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {post.category && (
              <Link href={`/category/${post.category.slug}`}>
                <Badge variant="primary">{post.category.name}</Badge>
              </Link>
            )}
            <span className="flex items-center gap-1.5 text-sm text-text-secondary">
              <Clock className="h-4 w-4" />
              {readTime} dakika okuma
            </span>
            <span className="flex items-center gap-1.5 text-sm text-text-secondary">
              <Eye className="h-4 w-4" />
              {post.view_count?.toLocaleString('tr-TR')} görüntülenme
            </span>
          </div>

          <h1 className="mb-6 text-4xl font-bold leading-tight text-text-primary md:text-5xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mb-6 text-lg text-text-secondary leading-relaxed border-l-4 border-primary pl-4">
              {post.excerpt}
            </p>
          )}

          {/* Author + Dates */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            <div className="flex items-center gap-3">
              <Avatar
                src={post.author?.avatar_url || undefined}
                alt={post.author?.name || 'Yazar'}
                size="lg"
              />
              <div>
                <p className="font-semibold text-text-primary">{post.author?.name || 'Sefa Çam'}</p>
                <div className="flex flex-wrap gap-3 text-xs text-text-tertiary">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Yayın: {formatDate(post.published_at || post.created_at)}
                  </span>
                  {post.updated_at !== post.created_at && (
                    <span className="flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" />
                      Güncelleme: {formatDate(post.updated_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ─── Featured Image ─── */}
        {post.featured_image_url && (
          <div className="relative mx-auto mb-10 h-64 w-full max-w-5xl overflow-hidden rounded-2xl md:h-96">
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>
        )}

        {/* ─── Content Area ─── */}
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_240px]">
            {/* Article Body */}
            <div>
              {/* TOC Mobile */}
              <div className="mb-8 lg:hidden">
                <TOC content={post.content} />
              </div>

              {/* Content */}
              <div className="prose prose-invert prose-headings:font-bold prose-headings:text-text-primary prose-p:text-text-secondary prose-a:text-primary prose-strong:text-text-primary prose-code:text-primary prose-pre:bg-surface prose-blockquote:border-primary prose-blockquote:text-text-secondary max-w-none">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>
            </div>

            {/* TOC Desktop (sticky) */}
            <div className="hidden lg:block">
              <div className="sticky top-28 space-y-6">
                <TOC content={post.content} />
              </div>
            </div>
          </div>

          {/* ─── Tags ─── */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {post.tags.map((tag: any) => (
                <Link key={tag.id} href={`/tag/${tag.slug}`}>
                  <Badge variant="secondary">#{tag.name}</Badge>
                </Link>
              ))}
            </div>
          )}

          {/* ─── Social Share ─── */}
          <div className="mt-10 rounded-xl border border-border bg-surface p-6">
            <SocialShare
              url={postUrl}
              title={post.title}
              description={post.excerpt || ''}
            />
          </div>

          {/* ─── Author Bio ─── */}
          {post.author && (
            <div className="mt-10 rounded-2xl border border-border bg-surface p-8">
              <div className="flex flex-col items-start gap-6 md:flex-row">
                <Avatar
                  src={post.author.avatar_url || undefined}
                  alt={post.author.name}
                  size="lg"
                />
                <div className="flex-1">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
                    Yazar
                  </p>
                  <h3 className="mb-2 text-xl font-bold text-text-primary">{post.author.name}</h3>
                  {post.author.bio && (
                    <p className="mb-4 text-text-secondary leading-relaxed">{post.author.bio}</p>
                  )}
                  <div className="flex gap-3">
                    {socialLinks.youtube && (
                      <a
                        href={socialLinks.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-hover text-text-secondary transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                        aria-label="YouTube"
                      >
                        <Youtube className="h-4 w-4" />
                      </a>
                    )}
                    {socialLinks.instagram && (
                      <a
                        href={socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-hover text-text-secondary transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                        aria-label="Instagram"
                      >
                        <Instagram className="h-4 w-4" />
                      </a>
                    )}
                    {post.author.email && (
                      <a
                        href={`mailto:${post.author.email}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-hover text-text-secondary transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                        aria-label="E-posta"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── FAQ ─── */}
          {faqItems.length > 0 && (
            <div className="mt-12 border-t border-border pt-12">
              <FAQ items={faqItems} />
            </div>
          )}

          {/* ─── Comments ─── */}
          <div className="mt-12 space-y-8 border-t border-border pt-12">
            <CommentList postId={post.id} />
            <CommentForm postId={post.id} />
          </div>
        </div>
      </article>

      {/* ─── Related Posts ─── */}
      {relatedPosts.length > 0 && (
        <section className="bg-surface py-16" aria-label="İlgili yazılar">
          <div className="container mx-auto px-6">
            <h2 className="mb-8 text-2xl font-bold text-text-primary">İlgili Yazılar</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((rp) => (
                <BlogCard
                  key={rp.id}
                  slug={rp.slug}
                  title={rp.title}
                  excerpt={rp.excerpt || ''}
                  featuredImage={rp.featured_image_url || undefined}
                  category={rp.category?.name || 'Genel'}
                  author={{
                    name: rp.author?.name || 'Sefa Çam',
                  }}
                  publishedAt={formatDate(rp.published_at || rp.created_at)}
                  readTime={calculateReadingTime(rp.content)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
