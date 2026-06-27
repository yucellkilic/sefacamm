import { Metadata } from 'next';
import type { Post, Author } from '@/types';

export function generatePostMetadata(post: Post, author?: Author): Metadata {
  const title = post.seo_title || `${post.title} | Sefa Çam Blog`;
  const description = post.seo_description || post.excerpt || '';
  const url = `https://sefacam.com/blog/${post.slug}`;

  return {
    title,
    description,
    authors: author ? [{ name: author.name }] : undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      url,
      siteName: 'Sefa Çam Blog',
      images: post.featured_image_url
        ? [
            {
              url: post.featured_image_url,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
      locale: 'tr_TR',
      type: 'article',
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at,
      authors: author ? [author.name] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || '',
      images: post.featured_image_url ? [post.featured_image_url] : [],
      creator: '@sefacamm',
    },
    alternates: {
      canonical: url,
    },
  };
}

export function generatePageMetadata(
  title: string,
  description: string,
  path: string = ''
): Metadata {
  const url = `https://sefacam.com${path}`;

  return {
    title: `${title} | Sefa Çam Blog`,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Sefa Çam Blog',
      locale: 'tr_TR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@sefacamm',
    },
    alternates: {
      canonical: url,
    },
  };
}
