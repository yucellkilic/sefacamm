import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { supabaseAdmin as supabase } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

// GET single post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !post) {
      return NextResponse.json({ error: 'Post bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json({ error: 'Post getirilemedi' }, { status: 500 });
  }
}

// PUT update post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, slug, excerpt, content, category, featured_image_url, is_published } = body;

    // Validate required fields
    if (!title || !slug || !content || !category) {
      return NextResponse.json(
        { error: 'Başlık, slug, içerik ve kategori zorunludur' },
        { status: 400 }
      );
    }

    // Check if post exists
    const { data: existingPost } = await supabase
      .from('posts')
      .select('slug')
      .eq('id', id)
      .single();

    if (!existingPost) {
      return NextResponse.json({ error: 'Post bulunamadı' }, { status: 404 });
    }

    // Check slug uniqueness (if changed)
    if (slug !== existingPost.slug) {
      const { data: duplicateSlug } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single();

      if (duplicateSlug) {
        return NextResponse.json({ error: 'Bu slug zaten kullanılıyor' }, { status: 409 });
      }
    }

    // Update post
    const { data: post, error } = await supabase
      .from('posts')
      .update({
        title,
        slug,
        excerpt: excerpt || '',
        content,
        category,
        featured_image_url: featured_image_url || null,
        is_published: is_published || false,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Revalidate pages
    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);
    if (existingPost.slug !== slug) {
      revalidatePath(`/blog/${existingPost.slug}`);
    }

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json({ error: 'Post güncellenemedi' }, { status: 500 });
  }
}

// DELETE post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabase.from('posts').delete().eq('id', id);

    if (error) throw error;

    // Revalidate blog page
    revalidatePath('/blog');

    return NextResponse.json({ success: true, message: 'Post silindi' });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json({ error: 'Post silinemedi' }, { status: 500 });
  }
}
