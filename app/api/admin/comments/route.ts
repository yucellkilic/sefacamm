import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { supabaseAdmin as supabase } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: comments, error } = await supabase
      .from('comments')
      .select('*, posts!inner(title, slug)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ comments: comments || [] });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json({ error: 'Yorumlar getirilemedi' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, is_approved } = await request.json();

    if (!id || typeof is_approved !== 'boolean') {
      return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
    }

    const { error } = await supabase
      .from('comments')
      .update({ is_approved })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: is_approved ? 'Yorum onaylandı' : 'Yorum reddedildi',
    });
  } catch (error) {
    console.error('Update comment error:', error);
    return NextResponse.json({ error: 'Yorum güncellenemedi' }, { status: 500 });
  }
}
