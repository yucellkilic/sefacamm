import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { supabaseAdmin as supabase } from '@/lib/supabase/admin';

export async function GET() {
  try {
    // Verify admin session
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      { count: publishedPosts },
      { count: draftPosts },
      { count: subscribers },
      { count: messages },
    ] = await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('is_published', false),
      supabase.from('subscribers').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
    ]);

    return NextResponse.json({
      publishedPosts: publishedPosts || 0,
      draftPosts: draftPosts || 0,
      subscribers: subscribers || 0,
      messages: messages || 0,
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
