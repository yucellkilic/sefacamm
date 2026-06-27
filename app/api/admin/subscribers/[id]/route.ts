import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { supabase } from '@/lib/supabase/client';

// DELETE subscriber
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

    const { error } = await supabase.from('subscribers').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Abone silindi' });
  } catch (error) {
    console.error('Delete subscriber error:', error);
    return NextResponse.json({ error: 'Abone silinemedi' }, { status: 500 });
  }
}
