import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CookieConsent from '@/components/ui/CookieConsent';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://sefacam.com'),
  title: {
    default: 'Sefa Çam | İçerik Üreticisi, YouTuber & Blogger',
    template: '%s | Sefa Çam',
  },
  description:
    'Sefa Çam — YouTube ve Instagram içerik üreticisi. Blog yazıları, düşünceler, deneyimler ve öğrendikler. Takip etmek için YouTube ve Instagram kanallarımı ziyaret edin.',
  keywords: [
    'Sefa Çam',
    'YouTuber',
    'içerik üreticisi',
    'blog',
    'YouTube',
    'Instagram',
    'teknoloji',
    'yaşam',
  ],
  authors: [{ name: 'Sefa Çam' }],
  creator: 'Sefa Çam',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://sefacam.com',
    siteName: 'Sefa Çam',
    title: 'Sefa Çam | İçerik Üreticisi, YouTuber & Blogger',
    description: 'YouTube ve Instagram içerik üreticisi Sefa Çam’ın resmi blogu.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Sefa Çam',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sefa Çam | İçerik Üreticisi',
    description: 'YouTube ve Instagram içerik üreticisi Sefa Çam’ın resmi blogu.',
    creator: '@sefacamm',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Sefa Çam Blog',
              url: 'https://sefacam.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://sefacam.com/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <Navbar />
        <div id="main-content" className="min-h-screen">
          {children}
        </div>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
