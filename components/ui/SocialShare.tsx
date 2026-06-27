'use client';

import { motion } from 'framer-motion';
import { Share2, Twitter, Linkedin, MessageCircle, Facebook, Link2, CheckCheck } from 'lucide-react';
import { useState } from 'react';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
}

export default function SocialShare({ url, title, description = '' }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description);

  const shareLinks = [
    {
      name: 'Twitter / X',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] hover:border-[#1DA1F2]/30',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDesc}`,
      color: 'hover:bg-[#0077B5]/10 hover:text-[#0077B5] hover:border-[#0077B5]/30',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      color: 'hover:bg-[#25D366]/10 hover:text-[#25D366] hover:border-[#25D366]/30',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:bg-[#1877F2]/10 hover:text-[#1877F2] hover:border-[#1877F2]/30',
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <Share2 className="h-4 w-4" />
          Paylaş:
        </span>

        {shareLinks.map((link) => (
          <motion.a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${link.name}'da paylaş`}
            className={`flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary transition-all ${link.color}`}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <link.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{link.name}</span>
          </motion.a>
        ))}

        {/* Copy link */}
        <motion.button
          onClick={copyToClipboard}
          aria-label="Linki kopyala"
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          {copied ? (
            <CheckCheck className="h-4 w-4 text-success" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">{copied ? 'Kopyalandı!' : 'Kopyala'}</span>
        </motion.button>
      </div>
    </div>
  );
}
