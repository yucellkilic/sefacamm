import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Geçersiz e-posta adresi' }, { status: 400 });
    }

    if (message.length < 20 || message.length > 2000) {
      return NextResponse.json(
        { error: 'Mesaj 20-2000 karakter arasında olmalıdır' },
        { status: 400 }
      );
    }

    // Insert into Supabase
    const { error: dbError } = await supabase
      .from('messages')
      .insert([{ name, email, subject, message }]);

    if (dbError) throw dbError;

    // Log it
    console.log('Contact form submission:', { name, email, subject, message });

    return NextResponse.json(
      {
        success: true,
        message: 'Mesajınız başarıyla gönderildi!',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json({ error: 'Mesaj gönderilemedi' }, { status: 500 });
  }
}
