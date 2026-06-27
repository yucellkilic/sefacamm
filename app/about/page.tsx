import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { generatePersonSchema } from '@/lib/seo/schemas';
import { Youtube, Instagram, Mail, BookOpen, Play, Users, ArrowRight, Star } from 'lucide-react';
import type { Author } from '@/types';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Hakkımda | Sefa Çam — İçerik Üreticisi, YouTuber',
  description:
    'Sefa Çam — YouTube ve Instagram içerik üreticisi. Hakkımda sayfasında kim olduğumu, neden içerik ürettiğimi ve neleri paylaştığımı öğrenebilirsiniz.',
  alternates: { canonical: 'https://sefacam.com/about' },
  openGraph: {
    title: 'Hakkımda | Sefa Çam',
    description: 'Sefa Çam — YouTube ve Instagram içerik üreticisi.',
    url: 'https://sefacam.com/about',
  },
};

const socialLinks = {
  youtube: 'https://www.youtube.com/@sefacamm?si=0-ZsgvpVhYqgEX12',
  instagram: 'https://www.instagram.com/kimbusefa34?igsh=MTBkaWk0YjhnOWxuaQ%3D%3D',
  email: 'sefacm18@gmail.com',
};

async function getStats() {
  const [{ count: postCount }, { data: author }] = await Promise.all([
    supabase.from('posts').select('id', { count: 'exact' }).eq('is_published', true),
    supabase.from('authors').select('*').eq('email', 'sefacm18@gmail.com').single(),
  ]);
  return { postCount: postCount || 0, author: author as Author | null };
}

export default async function AboutPage() {
  const { postCount, author } = await getStats();
  const personSchema = author ? generatePersonSchema(author) : null;

  return (
    <>
      {personSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      )}

      <main className="container mx-auto px-6 py-20">
        {/* ── Hero ── */}
        <section className="mx-auto mb-24 max-w-4xl text-center">
          {/* Avatar with ring */}
          <div className="relative mx-auto mb-8 inline-block">
            <div
              className="absolute inset-0 rounded-full blur-xl opacity-40"
              style={{ background: 'radial-gradient(circle, #ffd700, transparent)' }}
            />
            <div
              className="relative h-36 w-36 overflow-hidden rounded-full"
              style={{
                background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
                padding: '3px',
              }}
            >
              <div className="h-full w-full overflow-hidden rounded-full bg-background">
                <Image
                  src="/logo.png"
                  alt={author?.name || 'Sefa Çam'}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Name */}
          <h1
            className="mb-2 font-black text-text-primary"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}
          >
            {author?.name || 'Sefa Çam'}
          </h1>

          {/* Role badge */}
          <div className="mb-6 flex items-center justify-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400 uppercase tracking-widest">
              <Youtube className="h-3.5 w-3.5" />
              YouTuber
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs font-bold text-pink-400 uppercase tracking-widest">
              <Instagram className="h-3.5 w-3.5" />
              İçerik Üreticisi
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase tracking-widest">
              <Star className="h-3.5 w-3.5" />
              Blogger
            </span>
          </div>

          {/* Bio */}
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-text-secondary">
            {author?.bio ||
              'YouTube ve Instagram\'da içerik üretiyorum. Hayatı, deneyimleri ve öğrendiklerimi paylaşmak için kamera karşısına geçiyorum — ve bu blogu yazıyorum. İçerik üretmek benim için sadece bir hobi değil, yaşam biçimi.'}
          </p>

          {/* Social buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={socialLinks.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 rounded-2xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-red-500 hover:scale-105"
              style={{ boxShadow: '0 4px 20px rgba(239,68,68,0.25)' }}
              aria-label="YouTube kanalı"
            >
              <Youtube className="h-5 w-5" />
              YouTube Kanalı
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 rounded-2xl px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                boxShadow: '0 4px 20px rgba(220,39,67,0.3)',
              }}
              aria-label="Instagram profili"
            >
              <Instagram className="h-5 w-5" />
              Instagram
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href={`mailto:${socialLinks.email}`}
              className="group flex items-center gap-2.5 rounded-2xl border border-border bg-surface px-6 py-3 text-sm font-bold text-text-primary transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              aria-label="E-posta gönder"
            >
              <Mail className="h-5 w-5" />
              E-posta
            </a>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="mx-auto mb-24 max-w-3xl" aria-label="İstatistikler">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                icon: BookOpen,
                label: 'Blog Yazısı',
                value: postCount ? `${postCount}` : '—',
                color: 'text-primary',
                bg: 'bg-primary/10',
                border: 'border-primary/20',
              },
              {
                icon: Play,
                label: 'YouTube Video',
                value: '∞',
                color: 'text-red-400',
                bg: 'bg-red-500/10',
                border: 'border-red-500/20',
              },
              {
                icon: Users,
                label: 'İzleyici & Takipçi',
                value: '—',
                color: 'text-pink-400',
                bg: 'bg-pink-500/10',
                border: 'border-pink-500/20',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`rounded-2xl border ${stat.border} ${stat.bg} p-8 text-center transition-transform hover:-translate-y-1`}
              >
                <div
                  className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${stat.bg}`}
                >
                  <stat.icon className={`h-7 w-7 ${stat.color}`} />
                </div>
                <div className={`mb-1 text-4xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-sm font-medium text-text-secondary">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── İçerik Üretimi Hakkında ── */}
        <section className="mx-auto mb-24 max-w-3xl">
          <h2 className="mb-6 text-3xl font-bold text-text-primary">Neden İçerik Üretiyorum?</h2>
          <div className="space-y-5 text-text-secondary leading-relaxed text-lg">
            <p>
              İnsanlarla bağlantı kurmak, deneyimlerimi paylaşmak ve belki de birine ilham vermek
              için. YouTube ve Instagram kanallarımda samimi, gerçek ve özgün içerikler üretiyorum.
              Kurgusal değil, gerçek hayat.
            </p>
            <p>
              Bu blog ise video kameranın yakalayamadığı şeyleri yazıya döküyor: daha uzun
              düşünceler, daha derin analizler, daha kapsamlı rehberler. İkisi birbirini
              tamamlıyor.
            </p>
            <p>
              Sosyal medyada takip etmek için aşağıdaki platformlarda bulabilirsiniz. Ve tabii
              ki{' '}
              <Link href="/contact" className="text-primary hover:text-primary-hover underline underline-offset-2">
                iletişime geçmekten
              </Link>{' '}
              çekinmeyin!
            </p>
          </div>
        </section>

        {/* ── Platform kartları ── */}
        <section className="mx-auto mb-24 max-w-3xl">
          <h2 className="mb-8 text-3xl font-bold text-text-primary">Platformlar</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* YouTube card */}
            <a
              href={socialLinks.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/5 p-6 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:-translate-y-1"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500">
                <Youtube className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-text-primary">YouTube</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Videolarımı izlemek için YouTube kanalımı ziyaret edin.
              </p>
              <ArrowRight className="absolute bottom-5 right-5 h-5 w-5 text-text-secondary transition-transform group-hover:translate-x-1 group-hover:text-red-400" />
            </a>

            {/* Instagram card */}
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl border border-pink-500/20 bg-pink-500/5 p-6 transition-all hover:border-pink-500/40 hover:bg-pink-500/10 hover:-translate-y-1"
            >
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                }}
              >
                <Instagram className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-text-primary">Instagram</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Anlık paylaşımlar ve hikayeler için Instagram&apos;da takip edin.
              </p>
              <ArrowRight className="absolute bottom-5 right-5 h-5 w-5 text-text-secondary transition-transform group-hover:translate-x-1 group-hover:text-pink-400" />
            </a>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="mx-auto max-w-3xl">
          <div
            className="rounded-3xl p-10 text-center"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,215,0,0.08) 0%, rgba(255,140,0,0.05) 100%)',
              border: '1px solid rgba(255,215,0,0.15)',
            }}
          >
            <h2 className="mb-4 text-2xl font-bold text-text-primary">
              Birlikte Büyüyelim! 🚀
            </h2>
            <p className="mb-8 text-text-secondary">
              Blog yazılarımı okuyun, kanalımı izleyin ve güncel kalın.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/blog"
                className="rounded-2xl bg-primary px-7 py-3 text-sm font-bold text-background transition-all hover:bg-primary-hover hover:scale-105"
              >
                Yazıları İncele
              </Link>
              <Link
                href="/contact"
                className="rounded-2xl border border-border bg-surface px-7 py-3 text-sm font-bold text-text-primary transition-all hover:border-primary/40 hover:bg-surface-hover"
              >
                İletişime Geç
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
