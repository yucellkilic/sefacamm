'use client';

import { useEffect, useState } from 'react';
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  Trash2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Mail,
  User,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  posts: { title: string; slug: string };
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/admin/comments');
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setComments(data.comments || []);
    } catch (err: any) {
      setError(err.message || 'Yorumlar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string, is_approved: boolean) => {
    setActionId(id);
    try {
      const response = await fetch('/api/admin/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_approved }),
      });

      const data = await response.json();
      if (data.success) {
        setComments(comments.map((c) => (c.id === id ? { ...c, is_approved } : c)));
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      alert('Hata: ' + (err.message || 'İşlem başarısız'));
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return;

    setActionId(id);
    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setComments(comments.filter((c) => c.id !== id));
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      alert('Hata: ' + (err.message || 'Yorum silinemedi'));
    } finally {
      setActionId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pendingComments = comments.filter((c) => !c.is_approved);
  const approvedComments = comments.filter((c) => c.is_approved);

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
            <MessageSquare className="h-8 w-8 text-primary" />
            Yorumlar
          </h1>
          <p className="text-text-secondary">Tüm yorumları yönetin</p>
        </div>
        <div className="flex gap-4">
          <div className="rounded-lg bg-warning/10 px-4 py-2">
            <p className="text-sm font-medium text-text-secondary">Onay Bekleyen</p>
            <p className="text-2xl font-bold text-warning">{pendingComments.length}</p>
          </div>
          <div className="rounded-lg bg-success/10 px-4 py-2">
            <p className="text-sm font-medium text-text-secondary">Onaylanan</p>
            <p className="text-2xl font-bold text-success">{approvedComments.length}</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-error/30 bg-error/10 p-4 text-error">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <MessageSquare className="mx-auto mb-4 h-16 w-16 text-text-tertiary" />
          <p className="text-lg font-medium text-text-secondary">Henüz yorum yok</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`rounded-xl border bg-surface p-6 transition-all hover:shadow-md ${
                comment.is_approved ? 'border-border' : 'border-warning/30 bg-warning/[0.02]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: Content */}
                <div className="min-w-0 flex-1">
                  {/* Author & Status */}
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-semibold text-text-primary">{comment.author_name}</span>
                    </div>
                    <a
                      href={`mailto:${comment.author_email}`}
                      className="flex items-center gap-1 text-sm text-text-tertiary hover:text-primary"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {comment.author_email}
                    </a>
                    {!comment.is_approved && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
                        <Clock className="h-3 w-3" />
                        Onay Bekliyor
                      </span>
                    )}
                  </div>

                  {/* Comment Text */}
                  <p className="mb-3 text-sm text-text-secondary leading-relaxed">
                    {comment.content}
                  </p>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-text-tertiary">
                    <span>{formatDate(comment.created_at)}</span>
                    <Link
                      href={`/blog/${comment.posts?.slug}`}
                      target="_blank"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {comment.posts?.title || 'Bilinmeyen Yazı'}
                    </Link>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  {!comment.is_approved ? (
                    <button
                      onClick={() => handleApprove(comment.id, true)}
                      disabled={actionId === comment.id}
                      className="inline-flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-2 text-sm font-medium text-success transition-all hover:bg-success hover:text-white disabled:opacity-50"
                    >
                      {actionId === comment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Onayla
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApprove(comment.id, false)}
                      disabled={actionId === comment.id}
                      className="inline-flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2 text-sm font-medium text-warning transition-all hover:bg-warning hover:text-white disabled:opacity-50"
                    >
                      {actionId === comment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      Reddet
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={actionId === comment.id}
                    className="inline-flex items-center gap-2 rounded-lg border border-error/30 bg-error/10 px-4 py-2 text-sm font-medium text-error transition-all hover:bg-error hover:text-white disabled:opacity-50"
                  >
                    {actionId === comment.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
