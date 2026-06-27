'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/posts');
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setPosts(data.posts || []);
    } catch (err: any) {
      setError(err.message || 'Yazılar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    setActionId(id);
    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !currentStatus }),
      });

      const data = await response.json();
      if (data.success) {
        setPosts(posts.map((p) => (p.id === id ? { ...p, is_published: !currentStatus } : p)));
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      alert('Hata: ' + (err.message || 'Durum güncellenemedi'));
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu yazıyı silmek istediğinizden emin misiniz?')) return;

    setActionId(id);
    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setPosts(posts.filter((p) => p.id !== id));
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      alert('Hata: ' + (err.message || 'Yazı silinemedi'));
    } finally {
      setActionId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold text-text-primary">
            <FileText className="h-8 w-8 text-primary" />
            Yazılar
          </h1>
          <p className="text-text-secondary">Tüm blog yazılarını yönetin</p>
        </div>
        <button
          onClick={() => router.push('/admin/posts/new')}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-background transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30"
        >
          <Plus className="h-5 w-5" />
          Yeni Yazı
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-error/30 bg-error/10 p-4 text-error">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Posts Table */}
      {posts.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <FileText className="mx-auto mb-4 h-16 w-16 text-text-tertiary" />
          <p className="mb-4 text-lg font-medium text-text-secondary">Henüz yazı yok</p>
          <button
            onClick={() => router.push('/admin/posts/new')}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-background transition-all hover:bg-primary-hover"
          >
            <Plus className="h-5 w-5" />
            İlk Yazıyı Oluştur
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary/20 bg-surface-hover">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                    Başlık
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                    Kategori
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-text-primary">
                    Durum
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                    Tarih
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-text-primary">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post, index) => (
                  <tr
                    key={post.id}
                    className={`border-b border-border transition-colors hover:bg-surface-hover ${
                      index % 2 === 0 ? 'bg-surface' : 'bg-background'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-text-primary">{post.title}</p>
                        <p className="text-xs text-text-tertiary">/{post.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        Blog
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {post.is_published ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                          <Eye className="h-3 w-3" />
                          Yayında
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
                          <EyeOff className="h-3 w-3" />
                          Taslak
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {formatDate(post.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/admin/posts/${post.id}/edit`)}
                          className="rounded-lg border border-primary/30 bg-primary/10 p-2 text-primary transition-all hover:bg-primary hover:text-background"
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleTogglePublish(post.id, post.is_published)}
                          disabled={actionId === post.id}
                          className="rounded-lg border border-border bg-surface-hover p-2 text-text-secondary transition-all hover:bg-surface hover:text-text-primary disabled:opacity-50"
                          title={post.is_published ? 'Yayından Kaldır' : 'Yayınla'}
                        >
                          {actionId === post.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : post.is_published ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={actionId === post.id}
                          className="rounded-lg border border-error/30 bg-error/10 p-2 text-error transition-all hover:bg-error hover:text-white disabled:opacity-50"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
