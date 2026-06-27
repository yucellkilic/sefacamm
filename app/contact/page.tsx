'use client';

import type { Metadata } from 'next';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, User, Send, Youtube, Instagram, MapPin } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter giriniz.').max(100),
  email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
  subject: z.string().min(3, 'Konu alanı en az 3 karakter olmalıdır.').max(200),
  message: z.string().min(20, 'Mesaj en az 20 karakter olmalıdır.').max(2000),
});

type ContactFormData = z.infer<typeof contactSchema>;

const contactInfo = [
  {
    icon: Mail,
    label: 'E-posta',
    value: 'sefacm18@gmail.com',
    href: 'mailto:sefacm18@gmail.com',
  },
  {
    icon: Youtube,
    label: 'YouTube',
    value: '@sefacamm',
    href: 'https://www.youtube.com/@sefacamm?si=0-ZsgvpVhYqgEX12',
  },
  {
    icon: Instagram,
    label: 'Instagram',
    value: '@kimbusefa34',
    href: 'https://www.instagram.com/kimbusefa34?igsh=MTBkaWk0YjhnOWxuaQ%3D%3D',
  },
];

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus('success');
        reset();
      } else {
        const err = await res.json();
        setStatus('error');
        setErrorMessage(err.error || 'Bir hata oluştu.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Bağlantı hatası. Lütfen tekrar deneyin.');
    }
  };

  return (
    <main className="container mx-auto px-6 py-16">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-text-primary md:text-5xl">İletişim</h1>
          <p className="mx-auto max-w-xl text-text-secondary">
            Sorularınız, önerileriniz veya işbirliği teklifleri için bana ulaşabilirsiniz.
            En kısa sürede yanıt veririm!
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          {/* Form */}
          <div className="rounded-2xl border border-border bg-surface p-8">
            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                  <Send className="h-8 w-8 text-success" />
                </div>
                <h2 className="mb-3 text-2xl font-bold text-text-primary">Mesajınız Alındı!</h2>
                <p className="text-text-secondary">
                  En kısa sürede size dönüş yapacağım. Teşekkürler!
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-6 rounded-lg border border-border px-5 py-2 text-sm text-text-secondary transition-colors hover:text-primary"
                >
                  Yeni Mesaj Gönder
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-text-secondary">
                      Ad Soyad <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                      <input
                        id="name"
                        type="text"
                        {...register('name')}
                        placeholder="Adınız Soyadınız"
                        className={`w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder-text-tertiary outline-none transition-all focus:ring-2 focus:ring-primary/20 ${errors.name ? 'border-error' : 'border-border focus:border-primary'}`}
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-xs text-error">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text-secondary">
                      E-posta <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                      <input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="ornek@email.com"
                        className={`w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder-text-tertiary outline-none transition-all focus:ring-2 focus:ring-primary/20 ${errors.email ? 'border-error' : 'border-border focus:border-primary'}`}
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-text-secondary">
                    Konu <span className="text-error">*</span>
                  </label>
                  <input
                    id="subject"
                    type="text"
                    {...register('subject')}
                    placeholder="Mesajınızın konusu"
                    className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary outline-none transition-all focus:ring-2 focus:ring-primary/20 ${errors.subject ? 'border-error' : 'border-border focus:border-primary'}`}
                  />
                  {errors.subject && <p className="mt-1 text-xs text-error">{errors.subject.message}</p>}
                </div>

                <div>
                  <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-text-secondary">
                    Mesaj <span className="text-error">*</span>
                  </label>
                  <textarea
                    id="message"
                    {...register('message')}
                    placeholder="Mesajınızı buraya yazın..."
                    rows={6}
                    className={`w-full resize-none rounded-lg border bg-background px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary outline-none transition-all focus:ring-2 focus:ring-primary/20 ${errors.message ? 'border-error' : 'border-border focus:border-primary'}`}
                  />
                  {errors.message && <p className="mt-1 text-xs text-error">{errors.message.message}</p>}
                </div>

                <motion.button
                  type="submit"
                  disabled={status === 'loading'}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-background transition-all hover:bg-primary-hover disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {status === 'loading' ? 'Gönderiliyor...' : 'Mesaj Gönder'}
                </motion.button>

                {status === 'error' && (
                  <p className="text-sm text-error text-center">{errorMessage}</p>
                )}
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="mb-5 text-lg font-bold text-text-primary">İletişim Bilgileri</h2>
              <div className="space-y-4">
                {contactInfo.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith('mailto') ? undefined : '_blank'}
                    rel={item.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                    className="group flex items-center gap-4 rounded-xl p-3 transition-all hover:bg-surface-hover"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-text-tertiary">{item.label}</p>
                      <p className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                        {item.value}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-surface to-background p-6">
              <h3 className="mb-2 font-semibold text-text-primary">Yanıt Süresi</h3>
              <p className="text-sm text-text-secondary">
                Genellikle 24-48 saat içinde yanıt vermeye çalışıyorum.
                Acil konular için e-posta tercih edebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
