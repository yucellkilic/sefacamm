import { Edit, Loader2 } from 'lucide-react';
import PostForm from '@/components/admin/PostForm';
import { supabase } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';

async function getPost(id: string) {
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !post) {
    return null;
  }

  return {
    ...post,
    category: (post as any).category || 'Genel',
  };
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold text-text-primary">
          <Edit className="h-8 w-8 text-primary" />
          Yazıyı Düzenle
        </h1>
        <p className="text-text-secondary">&quot;{post.title}&quot; yazısını düzenleyin</p>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-surface p-8">
        <PostForm
          postId={post.id}
          initialData={{
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || '',
            content: post.content,
            category: post.category,
            featured_image_url: post.featured_image_url || '',
            is_published: post.is_published,
          }}
        />
      </div>
    </div>
  );
}
