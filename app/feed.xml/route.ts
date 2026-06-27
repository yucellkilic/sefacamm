import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const { data: posts } = await supabase
    .from('posts')
    .select('*, author:authors(*), category:categories(*)')
    .eq('is_published', true)
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(50);

  const siteUrl = 'https://sefacam.com';

  const items = (posts ?? [])
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt || ''}]]></description>
      <pubDate>${new Date(post.published_at!).toUTCString()}</pubDate>
      ${post.category ? `<category>${escapeXml(post.category.name)}</category>` : ''}
      ${post.author ? `<author>${escapeXml(post.author.email || '')} (${escapeXml(post.author.name)})</author>` : ''}
      ${post.featured_image_url ? `<enclosure url="${escapeXml(post.featured_image_url)}" type="image/jpeg" length="0" />` : ''}
    </item>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Sefa Çam Blog</title>
    <link>${siteUrl}</link>
    <description>Sefa Çam — YouTube ve Instagram içerik üreticisi. Blog yazıları, düşünceler, deneyimler ve öğrendikler.</description>
    <language>tr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${siteUrl}/logo.png</url>
      <title>Sefa Çam Blog</title>
      <link>${siteUrl}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
