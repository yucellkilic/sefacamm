'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, Youtube, Instagram } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'Hakkımda' },
  { href: '/contact', label: 'İletişim' },
];

const socialLinks = [
  {
    href: 'https://www.youtube.com/@sefacamm?si=0-ZsgvpVhYqgEX12',
    icon: Youtube,
    label: 'YouTube',
    color: 'hover:text-red-400',
  },
  {
    href: 'https://www.instagram.com/kimbusefa34?igsh=MTBkaWk0YjhnOWxuaQ%3D%3D',
    icon: Instagram,
    label: 'Instagram',
    color: 'hover:text-pink-400',
  },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <motion.header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'backdrop-blur-xl bg-background/85 shadow-[0_1px_0_rgba(255,215,0,0.08)]'
          : 'bg-transparent',
        isHidden && '-translate-y-full'
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <nav
        className="container mx-auto flex items-center justify-between px-6 py-3"
        aria-label="Ana navigasyon"
      >
        {/* Logo */}
        <Link href="/" className="relative z-50 flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
            <Image
              src="/logo.png"
              alt="Sefa Çam"
              width={52}
              height={52}
              className="h-[52px] w-[52px] rounded-xl object-contain"
              priority
            />
          </motion.div>
          <div className="hidden sm:block">
            <div className="text-base font-bold leading-none text-text-primary">
              Sefa Çam
            </div>
            <div className="mt-0.5 text-xs font-medium text-text-secondary tracking-wider">
              İçerik Üreticisi
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative text-sm font-medium transition-colors hover:text-primary',
                pathname === link.href ? 'text-primary' : 'text-text-secondary'
              )}
              aria-current={pathname === link.href ? 'page' : undefined}
            >
              {link.label}
              {pathname === link.href && (
                <motion.div
                  className="absolute -bottom-1 left-0 h-0.5 w-full bg-primary rounded-full"
                  layoutId="underline"
                />
              )}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden items-center gap-4 md:flex">
          {/* Social icons */}
          {socialLinks.map(({ href, icon: Icon, label, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className={cn(
                'text-text-secondary transition-all hover:scale-110',
                color
              )}
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}

          {/* Divider */}
          <div className="h-5 w-px bg-border" />

          {/* Search */}
          <Link
            href="/search"
            className="text-text-secondary transition-colors hover:text-primary"
            aria-label="Arama"
          >
            <Search className="h-5 w-5" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative z-50 text-text-primary md:hidden"
          aria-label={isOpen ? 'Menüyü kapat' : 'Menüyü aç'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl md:hidden"
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex h-full flex-col items-center justify-center gap-8">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        'text-3xl font-bold transition-colors hover:text-primary',
                        pathname === link.href ? 'text-primary' : 'text-text-primary'
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile social links */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navLinks.length * 0.08 + 0.1 }}
                  className="mt-4 flex items-center gap-6"
                >
                  <a
                    href="https://www.youtube.com/@sefacamm?si=0-ZsgvpVhYqgEX12"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="text-text-secondary hover:text-red-400 transition-colors"
                  >
                    <Youtube className="h-7 w-7" />
                  </a>
                  <a
                    href="https://www.instagram.com/kimbusefa34?igsh=MTBkaWk0YjhnOWxuaQ%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="text-text-secondary hover:text-pink-400 transition-colors"
                  >
                    <Instagram className="h-7 w-7" />
                  </a>
                  <Link
                    href="/search"
                    className="text-text-secondary hover:text-primary transition-colors"
                    aria-label="Arama"
                  >
                    <Search className="h-7 w-7" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
