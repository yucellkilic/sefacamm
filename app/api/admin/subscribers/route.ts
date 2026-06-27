import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { supabase } from '@/lib/supabase/client';

// GET all subscribers
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: subscribers, error } = await supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ subscribers: subscribers || [] });
  } catch (error) {
    console.error('Get subscribers error:', error);
    return NextResponse.json({ error: 'Aboneler getirilemedi' }, { status: 500 });
  }
}
