import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export const revalidate = 86400; // Cache for 24 hours

export async function GET() {
  try {
    const baseUrl = 'https://sefacam.com';

    // Static pages
    const staticPages = ['', '/about', '/contact', '/privacy', '/blog'];
    const staticUrls = staticPages.map(
      (page) => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page === '' || page === '/blog' ? 'daily' : 'monthly'}</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`
    );

    // Fetch dynamic posts, categories, and tags from Supabase
    const [
      { data: posts },
      { data: categories },
      { data: tags },
    ] = await Promise.all([
      supabase.from('posts').select('slug, updated_at').eq('is_published', true),
      supabase.from('categories').select('slug'),
      supabase.from('tags').select('slug'),
    ]);

    const postUrls = (posts || []).map(
      (post) => `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    );

    const categoryUrls = (categories || []).map(
      (cat) => `
  <url>
    <loc>${baseUrl}/category/${cat.slug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
    );

    const tagUrls = (tags || []).map(
      (tag) => `
  <url>
    <loc>${baseUrl}/tag/${tag.slug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.4</priority>
  </url>`
    );

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.join('')}
${postUrls.join('')}
${categoryUrls.join('')}
${tagUrls.join('')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return NextResponse.json({ error: 'Failed to generate sitemap' }, { status: 500 });
  }
}
