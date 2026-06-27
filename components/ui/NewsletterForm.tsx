'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Bell } from 'lucide-react';

interface NewsletterFormProps {
  variant?: 'default' | 'compact';
}

export default function NewsletterForm({ variant = 'default' }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Bir hata oluştu.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Bağlantı hatası. Lütfen tekrar deneyin.');
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-success/30 bg-success/10 px-6 py-8 text-center"
      >
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-success/20">
          <Bell className="h-7 w-7 text-success" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-text-primary">Abone Oldunuz! 🎉</h3>
        <p className="text-sm text-text-secondary">
          Yeni yazılardan haberdar edileceksiniz.
        </p>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta adresiniz"
          required
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm text-text-primary placeholder-text-tertiary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background transition-all hover:bg-primary-hover disabled:opacity-50"
        >
          {status === 'loading' ? '...' : 'Abone Ol'}
        </button>
      </form>
    );
  }

  return (
    <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-surface to-background p-8 text-center shadow-glow">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Mail className="h-7 w-7 text-primary" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-text-primary">
        Bültene Abone Ol
      </h2>
      <p className="mb-6 text-text-secondary">
        Yeni yazılar yayınlandığında ilk sen haberdar ol. Spam yok, söz!
      </p>

      <form onSubmit={handleSubmit} className="mx-auto max-w-md">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-posta adresiniz"
            required
            className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm text-text-primary placeholder-text-tertiary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            aria-label="E-posta adresi"
          />
          <motion.button
            type="submit"
            disabled={status === 'loading'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-background transition-all hover:bg-primary-hover disabled:opacity-50"
          >
            {status === 'loading' ? 'Kaydediliyor...' : 'Abone Ol'}
          </motion.button>
        </div>
        {status === 'error' && (
          <p className="mt-3 text-sm text-error">{errorMessage}</p>
        )}
      </form>
    </section>
  );
}
