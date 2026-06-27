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
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const pathname = usePathname();

  // Mobil menü açıkken navbar'ı asla gizleme
  const isHidden = !isOpen && isScrollingDown && lastScrollY > 100;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);
      
      // Aşağı scroll kontrolü
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsScrollingDown(true);
      } else {
        setIsScrollingDown(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (isOpen) {
      // Mobil menü açıkken scroll'u engelle ve navbar'ı göster
      document.body.style.overflow = 'hidden';
      setIsScrollingDown(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <motion.header
      className={cn(
        'fixed top-0 z-50 w-full transition-colors duration-200',
        isScrolled || isOpen
          ? 'backdrop-blur-xl bg-background/95 shadow-[0_1px_0_rgba(255,215,0,0.08)]'
          : 'bg-transparent'
      )}
      animate={{ y: isHidden ? -100 : 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
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
          className="relative z-[60] text-text-primary transition-transform hover:scale-110 active:scale-95 md:hidden"
          aria-label={isOpen ? 'Menüyü kapat' : 'Menüyü aç'}
          aria-expanded={isOpen}
        >
          <motion.div
            initial={false}
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.div>
        </button>

        {/* Mobile Menu */}
        <AnimatePresence mode="wait">
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsOpen(false)}
              />
              
              {/* Menu Panel */}
              <motion.div
                className="fixed inset-y-0 right-0 z-[45] w-[85vw] max-w-sm bg-background/98 backdrop-blur-2xl shadow-2xl md:hidden"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              >
                {/* Menu content container */}
                <div className="flex h-full flex-col pt-24 pb-8 px-8">
                  {/* Navigation Links */}
                  <nav className="flex flex-col gap-2">
                    {navLinks.map((link, index) => (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.06, duration: 0.3 }}
                      >
                        <Link
                          href={link.href}
                          className={cn(
                            'block py-3 px-4 rounded-lg text-2xl font-bold transition-all hover:bg-primary/10 hover:text-primary hover:translate-x-1',
                            pathname === link.href 
                              ? 'text-primary bg-primary/5' 
                              : 'text-text-primary'
                          )}
                        >
                          {link.label}
                          {pathname === link.href && (
                            <motion.div
                              className="mt-1 h-1 w-12 bg-primary rounded-full"
                              layoutId="mobile-underline"
                            />
                          )}
                        </Link>
                      </motion.div>
                    ))}
                  </nav>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Mobile social links */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: navLinks.length * 0.06 + 0.1, duration: 0.3 }}
                    className="space-y-4"
                  >
                    {/* Divider */}
                    <div className="h-px w-full bg-border/50" />
                    
                    {/* Social icons */}
                    <div className="flex items-center justify-center gap-6">
                      <a
                        href="https://www.youtube.com/@sefacamm?si=0-ZsgvpVhYqgEX12"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="YouTube"
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400 transition-all hover:bg-red-500/20 hover:scale-110 active:scale-95"
                      >
                        <Youtube className="h-6 w-6" />
                      </a>
                      <a
                        href="https://www.instagram.com/kimbusefa34?igsh=MTBkaWk0YjhnOWxuaQ%3D%3D"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-500/10 text-pink-400 transition-all hover:bg-pink-500/20 hover:scale-110 active:scale-95"
                      >
                        <Instagram className="h-6 w-6" />
                      </a>
                      <Link
                        href="/search"
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-all hover:bg-primary/20 hover:scale-110 active:scale-95"
                        aria-label="Arama"
                      >
                        <Search className="h-6 w-6" />
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
