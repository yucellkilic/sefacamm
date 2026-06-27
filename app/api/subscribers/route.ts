import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Geçersiz e-posta adresi' }, { status: 400 });
    }

    // Check if already exists
    const { data: existing } = await supabase
      .from('subscribers')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kayıtlı' },
        { status: 409 }
      );
    }

    // Insert new subscriber
    const { error } = await supabase
      .from('subscribers')
      .insert([{ email }]);

    if (error) throw error;

    return NextResponse.json(
      { success: true, message: 'Başarıyla abone oldunuz!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error subscribing:', error);
    return NextResponse.json({ error: 'Abonelik işlemi başarısız oldu' }, { status: 500 });
  }
}
