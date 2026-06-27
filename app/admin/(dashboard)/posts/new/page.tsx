import { Plus } from 'lucide-react';
import PostForm from '@/components/admin/PostForm';

export default function NewPostPage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold text-text-primary">
          <Plus className="h-8 w-8 text-primary" />
          Yeni Yazı Oluştur
        </h1>
        <p className="text-text-secondary">Blog için yeni bir yazı ekleyin</p>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-surface p-8">
        <PostForm />
      </div>
    </div>
  );
}
