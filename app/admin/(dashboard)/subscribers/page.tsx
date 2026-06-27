'use client';

import { useEffect, useState } from 'react';
import { Users, Trash2, AlertCircle, Loader2, Mail, Calendar, CheckCircle } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  verified: boolean;
  created_at: string;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const response = await fetch('/api/admin/subscribers');
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      setSubscribers(data.subscribers || []);
    } catch (err: any) {
      setError(err.message || 'Aboneler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu aboneyi silmek istediğinizden emin misiniz?')) return;

    setDeleteId(id);
    try {
      const response = await fetch(`/api/admin/subscribers/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setSubscribers(subscribers.filter((s) => s.id !== id));
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      alert('Hata: ' + (err.message || 'Abone silinemedi'));
    } finally {
      setDeleteId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
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
            <Users className="h-8 w-8 text-primary" />
            Aboneler
          </h1>
          <p className="text-text-secondary">Newsletter abone listesi</p>
        </div>
        <div className="rounded-lg bg-success/10 px-4 py-2">
          <p className="text-sm font-medium text-text-secondary">Toplam Abone</p>
          <p className="text-2xl font-bold text-success">{subscribers.length}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-error/30 bg-error/10 p-4 text-error">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Subscribers Table */}
      {subscribers.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <Users className="mx-auto mb-4 h-16 w-16 text-text-tertiary" />
          <p className="text-lg font-medium text-text-secondary">Henüz abone yok</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary/20 bg-surface-hover">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                    Durum
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Kayıt Tarihi
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-text-primary">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber, index) => (
                  <tr
                    key={subscriber.id}
                    className={`border-b border-border transition-colors hover:bg-surface-hover ${
                      index % 2 === 0 ? 'bg-surface' : 'bg-background'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium text-text-primary">{subscriber.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {subscriber.verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                          <CheckCircle className="h-3 w-3" />
                          Doğrulanmış
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
                          <AlertCircle className="h-3 w-3" />
                          Bekliyor
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {formatDate(subscriber.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(subscriber.id)}
                        disabled={deleteId === subscriber.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-error/30 bg-error/10 px-4 py-2 text-sm font-medium text-error transition-all hover:bg-error hover:text-white disabled:opacity-50"
                      >
                        {deleteId === subscriber.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Sil
                      </button>
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
