import { NextResponse } from 'next/server';

export async function GET() {
  const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /static/

Sitemap: https://sefacam.com/sitemap.xml
`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
