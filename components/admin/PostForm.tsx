'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  featured_image_url: string;
  is_published: boolean;
}

interface PostFormProps {
  postId?: string;
  initialData?: Partial<PostFormData>;
}

export default function PostForm({ postId, initialData }: PostFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<PostFormData>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    category: initialData?.category || '',
    featured_image_url: initialData?.featured_image_url || '',
    is_published: initialData?.is_published || false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[ğ]/g, 'g')
      .replace(/[ü]/g, 'u')
      .replace(/[ş]/g, 's')
      .replace(/[ı]/g, 'i')
      .replace(/[ö]/g, 'o')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleTitleChange = (title: string) => {
    setFormData({ ...formData, title });
    // Auto-generate slug only if slug is empty or matches the previous title's slug
    if (!postId || !formData.slug) {
      setFormData({ ...formData, title, slug: generateSlug(title) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const url = postId ? `/api/admin/posts/${postId}` : '/api/admin/posts';
      const method = postId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success || data.post) {
        setMessage({
          type: 'success',
          text: postId ? 'Yazı başarıyla güncellendi! ✓' : 'Yazı başarıyla oluşturuldu! ✓',
        });
        setTimeout(() => {
          router.push('/admin/posts');
          router.refresh();
        }, 1500);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'İşlem başarısız' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-2 rounded-lg border p-4 animate-slide-down ${
            message.type === 'success'
              ? 'border-success/30 bg-success/10 text-success'
              : 'border-error/30 bg-error/10 text-error'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="mb-2 block text-sm font-medium text-text-primary">
          Başlık <span className="text-error">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          maxLength={200}
          placeholder="Blog yazısı başlığı"
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-text-primary placeholder-text-tertiary transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="mb-2 block text-sm font-medium text-text-primary">
          Slug (URL) <span className="text-error">*</span>
        </label>
        <input
          type="text"
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          required
          maxLength={200}
          placeholder="blog-yazi-url"
          className="w-full rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm text-text-primary placeholder-text-tertiary transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <p className="mt-1 text-xs text-text-tertiary">URL: /blog/{formData.slug || 'slug'}</p>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="mb-2 block text-sm font-medium text-text-primary">
          Kategori <span className="text-error">*</span>
        </label>
        <input
          type="text"
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
          placeholder="Teknoloji, Yaşam, vb."
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-text-primary placeholder-text-tertiary transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Excerpt */}
      <div>
        <label htmlFor="excerpt" className="mb-2 block text-sm font-medium text-text-primary">
          Özet
        </label>
        <textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          rows={3}
          maxLength={300}
          placeholder="Kısa bir açıklama (opsiyonel)"
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-text-primary placeholder-text-tertiary transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <p className="mt-1 text-xs text-text-tertiary">{formData.excerpt.length}/300 karakter</p>
      </div>

      {/* Content */}
      <div>
        <label htmlFor="content" className="mb-2 block text-sm font-medium text-text-primary">
          İçerik (Markdown) <span className="text-error">*</span>
        </label>
        <textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          required
          rows={16}
          placeholder="# Başlık&#10;&#10;İçeriğinizi markdown formatında yazın..."
          className="w-full rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm text-text-primary placeholder-text-tertiary transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Featured Image URL */}
      <div>
        <label htmlFor="featured_image_url" className="mb-2 block text-sm font-medium text-text-primary">
          Kapak Görseli URL
        </label>
        <input
          type="url"
          id="featured_image_url"
          value={formData.featured_image_url}
          onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
          placeholder="https://example.com/image.jpg"
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-text-primary placeholder-text-tertiary transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Published Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-surface-hover p-4">
        <div>
          <label htmlFor="is_published" className="block text-sm font-medium text-text-primary">
            Yayın Durumu
          </label>
          <p className="mt-1 text-xs text-text-secondary">
            {formData.is_published ? 'Yazı yayında olacak' : 'Yazı taslak olarak kaydedilecek'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, is_published: !formData.is_published })}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all ${
            formData.is_published
              ? 'bg-success/10 text-success hover:bg-success hover:text-white'
              : 'bg-warning/10 text-warning hover:bg-warning hover:text-white'
          }`}
        >
          {formData.is_published ? (
            <>
              <Eye className="h-4 w-4" />
              Yayınla
            </>
          ) : (
            <>
              <EyeOff className="h-4 w-4" />
              Taslak
            </>
          )}
        </button>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-4 border-t border-border pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isLoading}
          className="rounded-lg border border-border px-6 py-3 font-medium text-text-secondary transition-all hover:bg-surface-hover disabled:opacity-50"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-semibold text-background transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              {postId ? 'Güncelle' : 'Oluştur'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
