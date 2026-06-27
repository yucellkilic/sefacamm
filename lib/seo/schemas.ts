import type { Post, Author, FAQItem } from '@/types';

export function generateBlogPostingSchema(post: Post, author?: Author) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: post.featured_image_url,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: author
      ? {
          '@type': 'Person',
          name: author.name,
          url: 'https://sefacam.com/about',
          image: author.avatar_url,
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Sefa Çam Blog',
      logo: {
        '@type': 'ImageObject',
        url: 'https://sefacam.com/logo.png',
      },
    },
    description: post.excerpt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://sefacam.com/blog/${post.slug}`,
    },
    articleBody: post.content,
    wordCount: post.content.split(' ').length,
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Sefa Çam Blog',
    url: 'https://sefacam.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://sefacam.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generatePersonSchema(author: Author) {
  const socialLinks = author.social_links as { youtube?: string; instagram?: string };

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    description: author.bio,
    image: author.avatar_url,
    email: author.email,
    sameAs: [socialLinks.youtube, socialLinks.instagram].filter(Boolean),
  };
}

export function generateCollectionPageSchema(
  posts: Array<{ title: string; slug: string; excerpt: string | null; published_at: string | null; featured_image_url: string | null }>,
  page: number = 1,
  totalPages: number = 1,
) {
  const siteUrl = 'https://sefacam.com';
  const currentUrl = page > 1 ? `${siteUrl}/blog?page=${page}` : `${siteUrl}/blog`;

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: page > 1 ? `Blog Yazıları - Sayfa ${page} | Sefa Çam` : 'Blog Yazıları | Sefa Çam',
    description: 'Sefa Çam\'ın tüm blog yazıları — yazılım, teknoloji, kariyer ve yaşam üzerine yazılar.',
    url: currentUrl,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: (page - 1) * 10 + index + 1,
        url: `${siteUrl}/blog/${post.slug}`,
        name: post.title,
        description: post.excerpt ?? undefined,
        image: post.featured_image_url ?? undefined,
      })),
    },
    numberOfItems: posts.length,
    ...(page > 1 ? { isPartOf: { '@type': 'CollectionPage', url: `${siteUrl}/blog` } } : {}),
  };
}

export function generateBreadcrumbListSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
