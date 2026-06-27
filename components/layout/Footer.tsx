'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Youtube, Instagram, Mail, ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

const socialLinks = {
  youtube: 'https://www.youtube.com/@sefacamm?si=0-ZsgvpVhYqgEX12',
  instagram: 'https://www.instagram.com/kimbusefa34?igsh=MTBkaWk0YjhnOWxuaQ%3D%3D',
  email: 'mailto:sefacm18@gmail.com',
};

const quickLinks = [
  { href: '/about', label: 'Hakkında' },
  { href: '/contact', label: 'İletişim' },
  { href: '/privacy', label: 'Gizlilik Politikası' },
];

export default function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-divider bg-surface">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Column 1: Logo & Tagline */}
          <div>
            <Link href="/" className="mb-4 inline-flex items-center gap-3">
              <Image src="/logo.png" alt="Sefa Çam" width={52} height={52} className="rounded-xl" />
              <div>
                <div className="text-base font-bold text-text-primary">Sefa Çam</div>
                <div className="text-xs text-text-secondary">İçerik Üreticisi</div>
              </div>
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed">
              YouTube ve Instagram&apos;da içerik üretiyorum. Bu blog, düşüncelerimi, deneyimlerimi ve içerik üretme yolculuğumu yazıya döktüğüm alanım.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-text-primary">Hızlı Linkler</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Social & Newsletter */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-text-primary">Takip Edin</h3>
            <div className="flex gap-3">
              <motion.a
                href={socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400 transition-all hover:bg-red-500 hover:text-white"
                whileHover={{ y: -3, scale: 1.05 }}
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </motion.a>
              <motion.a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400 transition-all hover:bg-pink-500 hover:text-white"
                whileHover={{ y: -3, scale: 1.05 }}
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </motion.a>
              <motion.a
                href={socialLinks.email}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all hover:bg-primary hover:text-background"
                whileHover={{ y: -3, scale: 1.05 }}
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-divider" />

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-text-secondary">
            © 2026 Sefa Çam - Tüm Hakları Saklıdır.
          </p>
          <a
            href="https://yucelkilic.tr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
          >
            Yücel Kılıç tarafından yapılmıştır
          </a>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-background shadow-lg transition-colors hover:bg-primary-hover"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Yukarı çık"
        >
          <ArrowUp className="h-6 w-6" />
        </motion.button>
      )}
    </footer>
  );
}
