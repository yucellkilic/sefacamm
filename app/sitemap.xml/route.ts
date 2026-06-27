import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export const revalidate = 86400;

const BASE_URL = 'https://sefacam.com';

function formatDate(date: string | null): string {
  if (!date) return new Date().toISOString().split('T')[0];
  return new Date(date).toISOString().split('T')[0];
}

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
  image?: string;
}

function buildXml(urls: SitemapUrl[]): string {
  const hasImages = urls.some(u => u.image);

  const ns = hasImages
    ? ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'
    : '';

  const entries = urls.map(u => {
    let xml = `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>`;
    if (u.image) {
      xml += `\n    <image:image>\n      <image:loc>${u.image}</image:loc>\n    </image:image>`;
    }
    xml += '\n  </url>';
    return xml;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${ns}>\n${entries}\n</urlset>`;
}

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [
      { data: posts },
      { data: categories },
      { data: tags },
    ] = await Promise.all([
      supabase
        .from('posts')
        .select('slug, featured_image_url, published_at, updated_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false }),
      supabase.from('categories').select('slug, name'),
      supabase.from('tags').select('slug, name'),
    ]);

    const urls: SitemapUrl[] = [];

    // Static pages
    urls.push(
      { loc: BASE_URL, lastmod: today, changefreq: 'daily', priority: '1.0' },
      { loc: `${BASE_URL}/blog`, lastmod: today, changefreq: 'daily', priority: '0.9' },
      { loc: `${BASE_URL}/about`, lastmod: today, changefreq: 'monthly', priority: '0.8' },
      { loc: `${BASE_URL}/contact`, lastmod: today, changefreq: 'monthly', priority: '0.6' },
      { loc: `${BASE_URL}/privacy`, lastmod: today, changefreq: 'yearly', priority: '0.3' },
    );

    // Blog posts
    for (const post of posts || []) {
      urls.push({
        loc: `${BASE_URL}/blog/${post.slug}`,
        lastmod: formatDate(post.updated_at || post.published_at),
        changefreq: 'monthly',
        priority: '0.8',
        image: post.featured_image_url || undefined,
      });
    }

    // Categories
    for (const cat of categories || []) {
      urls.push({
        loc: `${BASE_URL}/category/${cat.slug}`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.6',
      });
    }

    // Tags
    for (const tag of tags || []) {
      urls.push({
        loc: `${BASE_URL}/tag/${tag.slug}`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.4',
      });
    }

    const sitemap = buildXml(urls);

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return NextResponse.json({ error: 'Failed to generate sitemap' }, { status: 500 });
  }
}
