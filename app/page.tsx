import { Suspense } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import BlogCard from '@/components/ui/BlogCard';
import Sidebar from '@/components/ui/Sidebar';
import NewsletterForm from '@/components/ui/NewsletterForm';
import InteractiveBackground from '@/components/ui/InteractiveBackground';
import { generateWebsiteSchema } from '@/lib/seo/schemas';
import { calculateReadingTime } from '@/utils/readingTime';
import { formatDate } from '@/utils/dateFormatter';
import type { PostWithRelations } from '@/types';
import type { Metadata } from 'next';
import { ArrowRight, Play, TrendingUp, Youtube, Instagram } from 'lucide-react';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Sefa Çam | İçerik Üreticisi, YouTube & Instagram',
  description:
    'Sefa Çam — YouTube ve Instagram içerik üreticisi. Teknoloji, yaşam ve güncel konularda özgün içerikler. Blog yazıları, videolar ve daha fazlası.',
  alternates: { canonical: 'https://sefacam.com' },
  openGraph: {
    title: 'Sefa Çam | İçerik Üreticisi',
    description: 'YouTube ve Instagram içerik üreticisi Sefa Çam\'ın resmi blogu.',
    url: 'https://sefacam.com',
  },
};

async function getHomeData() {
  const [
    { data: featuredPosts },
    { data: popularPosts },
    { data: categories },
    { data: siteSettings },
  ] = await Promise.all([
    supabase
      .from('posts')
      .select('*, author:authors(*), category:categories(*)')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(6),
    supabase
      .from('posts')
      .select('id, slug, title, view_count, featured_image_url, published_at, created_at')
      .eq('is_published', true)
      .order('view_count', { ascending: false })
      .limit(5),
    supabase
      .from('categories')
      .select('id, name, slug')
      .limit(10),
    supabase
      .from('site_settings' as any)
      .select('key, value')
      .in('key', ['hero_title', 'hero_subtitle', 'hero_button_text']),
  ]);

  const rows = ((siteSettings || []) as unknown) as { key: string; value: string }[];
  const heroSettings: Record<string, string> = {};
  for (const { key, value } of rows) {
    heroSettings[key] = value;
  }

  return {
    featuredPosts: (featuredPosts || []) as PostWithRelations[],
    popularPosts: popularPosts || [],
    categories: categories || [],
    hero_title: heroSettings.hero_title || 'Sefa Çam',
    hero_subtitle: heroSettings.hero_subtitle || 'İçerik Üreticisi · YouTuber · Blogger',
    hero_button_text: heroSettings.hero_button_text || 'Blog Yazıları',
  };
}

async function getCategoryPosts(categorySlug: string) {
  const { data: category } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .eq('slug', categorySlug)
    .single();

  if (!category) return null;

  const { data: posts } = await supabase
    .from('posts')
    .select('*, author:authors(*), category:categories(*)')
    .eq('category_id', category.id)
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(4);

  return { category, posts: (posts || []) as PostWithRelations[] };
}

export default async function Home() {
  const { featuredPosts, popularPosts, categories, hero_title, hero_subtitle, hero_button_text } = await getHomeData();

  const categoryPostsData = await Promise.all(
    categories.slice(0, 3).map((cat) => getCategoryPosts(cat.slug))
  );
  const categoryBlocks = categoryPostsData.filter(Boolean);

  const websiteSchema = generateWebsiteSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden bg-background isolate"
        style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', zIndex: 0 }}
        aria-label="Hero"
      >
        {/* Interactive canvas background */}
        <InteractiveBackground />

        {/* Deep radial gradient overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,215,0,0.04) 0%, transparent 70%)',
            zIndex: 2,
          }}
        />

        {/* Bottom fade */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
          style={{
            background: 'linear-gradient(to bottom, transparent, var(--background))',
            zIndex: 3,
          }}
        />

        <div className="container relative mx-auto px-6 py-32 text-center" style={{ zIndex: 4 }}>
          {/* Platform badges */}
          <div className="mb-8 flex items-center justify-center gap-3 flex-wrap">
            <a
              href="https://www.youtube.com/@sefacamm?si=0-ZsgvpVhYqgEX12"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-all hover:border-red-500/60 hover:bg-red-500/20 hover:scale-105"
            >
              <Youtube className="h-4 w-4" />
              YouTube&apos;da Takip Et
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="https://www.instagram.com/kimbusefa34?igsh=MTBkaWk0YjhnOWxuaQ%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-2 text-sm font-semibold text-pink-400 transition-all hover:border-pink-500/60 hover:bg-pink-500/20 hover:scale-105"
            >
              <Instagram className="h-4 w-4" />
              Instagram&apos;da Takip Et
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          {/* Name */}
          <h1 className="mb-5 font-bold leading-none tracking-tighter text-text-primary"
            style={{ fontSize: 'clamp(3rem, 10vw, 7rem)' }}>
            <span
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #ffd700 50%, #ffc107 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Sefa Çam
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="mx-auto mb-4 max-w-xl text-lg font-medium text-text-secondary"
            style={{ letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.85rem' }}
          >
            {hero_subtitle}
          </p>

          {/* Description */}
          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-text-secondary md:text-xl">
            YouTube ve Instagram&apos;da özgün içerikler üretiyorum. Bu blogda ise düşüncelerimi,
            deneyimlerimi ve içerik üretme yolculuğumu yazıya döküyorum.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="https://www.youtube.com/@sefacamm?si=0-ZsgvpVhYqgEX12"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 rounded-2xl bg-red-600 px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-red-500 hover:scale-105 hover:shadow-red-500/30"
              style={{ boxShadow: '0 0 30px rgba(239,68,68,0.3)' }}
            >
              <Play className="h-5 w-5 fill-current" />
              Kanalıma Git
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <Link
              href="/blog"
              className="group flex items-center gap-2.5 rounded-2xl border border-primary/40 bg-primary/10 px-8 py-4 text-base font-bold text-primary transition-all hover:bg-primary hover:text-background hover:scale-105"
              style={{ backdropFilter: 'blur(8px)' }}
            >
              {hero_button_text}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-20 grid max-w-2xl grid-cols-3 gap-8">
            {[
              { label: 'Makale', value: featuredPosts.length > 0 ? `${featuredPosts.length}+` : '10+' },
              { label: 'YouTube', value: 'İçerik' },
              { label: 'Instagram', value: 'Takipçi' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className="text-3xl font-black text-primary md:text-4xl"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {stat.value}
                </div>
                <div className="mt-1 text-sm font-medium text-text-secondary uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-tertiary"
          style={{ zIndex: 4 }}
          aria-hidden="true"
        >
          <div className="h-10 w-6 rounded-full border-2 border-text-tertiary/40 flex items-start justify-center p-1">
            <div
              className="h-2 w-1.5 rounded-full bg-primary"
              style={{
                animation: 'scrollDot 2s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      </section>

      {/* ─── Main Content + Sidebar ─────────────────────────── */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px]">
          {/* Main */}
          <main>
            {/* Son Yazılar */}
            <section className="mb-16">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="flex items-center gap-3 text-3xl font-bold text-text-primary">
                  <TrendingUp className="h-7 w-7 text-primary" />
                  Son Yazılar
                </h2>
                <Link
                  href="/blog"
                  className="group flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover"
                >
                  Tümünü Gör
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {featuredPosts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {featuredPosts.map((post) => (
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
              ) : (
                <div className="rounded-xl border border-border bg-surface p-12 text-center">
                  <p className="text-text-secondary">Henüz yayınlanmış yazı yok.</p>
                </div>
              )}
            </section>

            {/* Kategori Blokları */}
            {categoryBlocks.map((block) => {
              if (!block || block.posts.length === 0) return null;
              return (
                <section key={block.category.id} className="mb-16">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-text-primary">
                        {block.category.name}
                      </h2>
                      {block.category.description && (
                        <p className="mt-1 text-sm text-text-secondary">
                          {block.category.description}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/category/${block.category.slug}`}
                      className="group flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover"
                    >
                      Tümünü Gör
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {block.posts.map((post) => (
                      <BlogCard
                        key={post.id}
                        slug={post.slug}
                        title={post.title}
                        excerpt={post.excerpt || ''}
                        featuredImage={post.featured_image_url || undefined}
                        category={post.category?.name || block.category.name}
                        author={{
                          name: post.author?.name || 'Sefa Çam',
                          avatar: post.author?.avatar_url || undefined,
                        }}
                        publishedAt={formatDate(post.published_at || post.created_at)}
                        readTime={calculateReadingTime(post.content)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Newsletter */}
            <NewsletterForm />
          </main>

          {/* Sidebar */}
          <aside>
            <div className="sticky top-24">
              <Sidebar popularPosts={popularPosts} categories={categories} />
            </div>
          </aside>
        </div>
      </div>

    </>
  );
}
