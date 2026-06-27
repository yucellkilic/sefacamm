import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Sayfa Bulunamadı | Sefa Çam Blog',
  description: 'Aradığınız sayfa bulunamadı.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="text-center">
        {/* 404 Number */}
        <div className="relative mb-6 select-none">
          <span className="bg-gradient-to-r from-primary via-yellow-400 to-secondary bg-clip-text text-[120px] font-black leading-none text-transparent md:text-[160px]">
            404
          </span>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-40 w-40 rounded-full bg-primary/10 blur-3xl md:h-60 md:w-60" />
          </div>
        </div>

        <h1 className="mb-4 text-3xl font-bold text-text-primary md:text-4xl">
          Sayfa Bulunamadı
        </h1>

        <p className="mx-auto mb-8 max-w-md text-text-secondary">
          Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
          Ana sayfaya dönerek devam edebilirsiniz.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-background shadow-glow transition-all hover:bg-primary-hover"
          >
            Ana Sayfaya Dön
          </Link>
          <Link
            href="/blog"
            className="rounded-xl border border-border bg-surface px-7 py-3 text-sm font-semibold text-text-primary transition-all hover:border-primary/40 hover:bg-surface-hover"
          >
            Blog Yazıları
          </Link>
        </div>
      </div>
    </main>
  );
}
