import { FileText, Users, Mail, FileEdit, TrendingUp, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

async function getDashboardStats() {
  try {
    const [
      { count: publishedPosts },
      { count: draftPosts },
      { count: subscribers },
      { count: messages },
      { count: pendingComments },
    ] = await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('is_published', false),
      supabase.from('subscribers').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase.from('comments').select('*', { count: 'exact', head: true }).eq('is_approved', false),
    ]);

    return {
      publishedPosts: publishedPosts || 0,
      draftPosts: draftPosts || 0,
      subscribers: subscribers || 0,
      messages: messages || 0,
      pendingComments: pendingComments || 0,
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return {
      publishedPosts: 0,
      draftPosts: 0,
      subscribers: 0,
      messages: 0,
      pendingComments: 0,
    };
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const statsCards = [
    {
      title: 'Yayınlanan Yazılar',
      value: stats.publishedPosts,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Taslak Yazılar',
      value: stats.draftPosts,
      icon: FileEdit,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Aboneler',
      value: stats.subscribers,
      icon: Users,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Mesajlar',
      value: stats.messages,
      icon: Mail,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      title: 'Onay Bekleyen Yorum',
      value: stats.pendingComments,
      icon: MessageSquare,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary">Blog yönetim paneline hoş geldiniz</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="group animate-scale-up rounded-xl border border-border bg-surface p-6 transition-all hover:scale-105 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className={`rounded-lg ${stat.bgColor} p-3`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mb-1 text-3xl font-bold text-text-primary">{stat.value}</div>
              <div className="text-sm font-medium text-text-secondary">{stat.title}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-text-primary">
          <TrendingUp className="h-5 w-5 text-primary" />
          Hızlı İşlemler
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/posts/new"
            className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-6 transition-all hover:border-primary hover:bg-surface-hover"
          >
            <div className="rounded-lg bg-primary/10 p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary group-hover:text-primary">
                Yeni Yazı Ekle
              </h3>
              <p className="text-sm text-text-secondary">Blog yazısı oluştur</p>
            </div>
          </Link>

          <Link
            href="/admin/posts"
            className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-6 transition-all hover:border-primary hover:bg-surface-hover"
          >
            <div className="rounded-lg bg-warning/10 p-3">
              <FileEdit className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary group-hover:text-primary">
                Yazıları Yönet
              </h3>
              <p className="text-sm text-text-secondary">Tüm yazıları düzenle</p>
            </div>
          </Link>

          <Link
            href="/admin/subscribers"
            className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-6 transition-all hover:border-primary hover:bg-surface-hover"
          >
            <div className="rounded-lg bg-success/10 p-3">
              <Users className="h-6 w-6 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary group-hover:text-primary">
                Abone Listesi
              </h3>
              <p className="text-sm text-text-secondary">Aboneleri görüntüle</p>
            </div>
          </Link>

          <Link
            href="/admin/comments"
            className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-6 transition-all hover:border-primary hover:bg-surface-hover"
          >
            <div className="rounded-lg bg-warning/10 p-3">
              <MessageSquare className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary group-hover:text-primary">
                Yorumlar
              </h3>
              <p className="text-sm text-text-secondary">Yorumları yönet</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
