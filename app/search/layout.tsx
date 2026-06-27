import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Arama | Sefa Çam Blog',
  description: 'Sefa Çam Blog içerisinde arama yapın.',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://sefacam.com/search' },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
