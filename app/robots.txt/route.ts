import { NextResponse } from 'next/server';

export async function GET() {
  const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /static/
Disallow: /search

# Crawl delay to prevent server overload
Crawl-delay: 10

# Clean URL parameters to avoid duplicate content
Clean-param: q /search

Sitemap: https://sefacam.com/sitemap.xml
`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
    },
  });
}
