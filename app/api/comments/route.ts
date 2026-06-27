import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const postId = searchParams.get('postId');

  if (!postId) {
    return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
  }

  try {
    const { data: comments, error } = await supabaseAdmin
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .eq('is_approved', true)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ comments: comments || [] });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { post_id, author_name, author_email, content } = await request.json();

    // Validation
    if (!post_id || !author_name || !author_email || !content) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur' }, { status: 400 });
    }

    if (author_name.length < 2 || author_name.length > 50) {
      return NextResponse.json(
        { error: 'İsim 2-50 karakter arasında olmalıdır' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(author_email)) {
      return NextResponse.json({ error: 'Geçersiz e-posta adresi' }, { status: 400 });
    }

    if (content.length < 10 || content.length > 1000) {
      return NextResponse.json(
        { error: 'Yorum 10-1000 karakter arasında olmalıdır' },
        { status: 400 }
      );
    }

    // Insert comment
    const { data: comment, error } = await supabaseAdmin
      .from('comments')
      .insert([{ post_id, author_name, author_email, content, is_approved: false }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        message: 'Yorumunuz onay bekliyor',
        comment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Yorum gönderilemedi' }, { status: 500 });
  }
}
