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
