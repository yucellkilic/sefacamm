import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { supabase } from '@/lib/supabase/client';
import { revalidatePath } from 'next/cache';

// GET all posts (including drafts)
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, slug, is_published, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ posts: posts || [] });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST create new post
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, excerpt, content, category, featured_image_url, is_published } = body;

    // Validate required fields
    if (!title || !slug || !content || !category) {
      return NextResponse.json(
        { error: 'Başlık, slug, içerik ve kategori zorunludur' },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const { data: existingPost } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingPost) {
      return NextResponse.json({ error: 'Bu slug zaten kullanılıyor' }, { status: 409 });
    }

    // Insert post
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        title,
        slug,
        excerpt: excerpt || '',
        content,
        featured_image_url: featured_image_url || null,
        is_published: is_published || false,
      } as any)
      .select()
      .single();

    if (error) throw error;

    // Revalidate blog pages
    revalidatePath('/blog');
    if (is_published) {
      revalidatePath(`/blog/${slug}`);
    }

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ error: 'Yazı oluşturulamadı' }, { status: 500 });
  }
}
