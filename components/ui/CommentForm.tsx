'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { MessageSquare, Send } from 'lucide-react';

const commentSchema = z.object({
  author_name: z.string().min(2, 'En az 2 karakter giriniz.').max(50, 'En fazla 50 karakter.'),
  author_email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
  content: z.string().min(10, 'Yorum en az 10 karakter olmalıdır.').max(1000, 'En fazla 1000 karakter.'),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentFormProps {
  postId: string;
  onSuccess?: () => void;
}

export default function CommentForm({ postId, onSuccess }: CommentFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  const onSubmit = async (data: CommentFormData) => {
    setStatus('loading');
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, post_id: postId }),
      });

      if (res.ok) {
        setStatus('success');
        reset();
        onSuccess?.();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-6 md:p-8">
      <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-text-primary">
        <MessageSquare className="h-6 w-6 text-primary" />
        Yorum Yaz
      </h3>

      {status === 'success' ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-success/10 border border-success/30 px-6 py-4"
        >
          <p className="text-success font-medium">
            ✅ Yorumunuz alındı! İncelendikten sonra yayınlanacak.
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="author_name" className="mb-1.5 block text-sm font-medium text-text-secondary">
                Ad Soyad <span className="text-error">*</span>
              </label>
              <input
                id="author_name"
                type="text"
                {...register('author_name')}
                placeholder="Adınız Soyadınız"
                className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary outline-none transition-all focus:ring-2 focus:ring-primary/20 ${
                  errors.author_name ? 'border-error focus:border-error' : 'border-border focus:border-primary'
                }`}
              />
              {errors.author_name && (
                <p className="mt-1 text-xs text-error">{errors.author_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="author_email" className="mb-1.5 block text-sm font-medium text-text-secondary">
                E-posta <span className="text-error">*</span>
              </label>
              <input
                id="author_email"
                type="email"
                {...register('author_email')}
                placeholder="ornek@email.com"
                className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary outline-none transition-all focus:ring-2 focus:ring-primary/20 ${
                  errors.author_email ? 'border-error focus:border-error' : 'border-border focus:border-primary'
                }`}
              />
              {errors.author_email && (
                <p className="mt-1 text-xs text-error">{errors.author_email.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="content" className="mb-1.5 block text-sm font-medium text-text-secondary">
              Yorumunuz <span className="text-error">*</span>
            </label>
            <textarea
              id="content"
              {...register('content')}
              placeholder="Yorumunuzu buraya yazın..."
              rows={5}
              className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary outline-none transition-all focus:ring-2 focus:ring-primary/20 resize-none ${
                errors.content ? 'border-error focus:border-error' : 'border-border focus:border-primary'
              }`}
            />
            {errors.content && (
              <p className="mt-1 text-xs text-error">{errors.content.message}</p>
            )}
          </div>

          <p className="text-xs text-text-tertiary">
            * E-posta adresiniz yayınlanmayacaktır. Yorumlar moderasyon sonrası yayınlanır.
          </p>

          <motion.button
            type="submit"
            disabled={status === 'loading'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-background transition-all hover:bg-primary-hover disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {status === 'loading' ? 'Gönderiliyor...' : 'Yorum Gönder'}
          </motion.button>

          {status === 'error' && (
            <p className="text-sm text-error">
              Bir hata oluştu. Lütfen tekrar deneyin.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
