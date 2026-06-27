import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'İletişim | Sefa Çam Blog',
  description: 'Sefa Çam ile iletişime geçin. Teklif, işbirliği ve geri bildirimleriniz için e-posta gönderebilirsiniz.',
  openGraph: {
    title: 'İletişim | Sefa Çam Blog',
    description: 'Sefa Çam ile iletişime geçin.',
    url: 'https://sefacam.com/contact',
    siteName: 'Sefa Çam Blog',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'İletişim | Sefa Çam Blog',
    description: 'Sefa Çam ile iletişime geçin.',
    creator: '@sefacamm',
  },
  alternates: { canonical: 'https://sefacam.com/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
