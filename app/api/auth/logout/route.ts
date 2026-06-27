import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth/session';

export async function POST() {
  try {
    await clearSessionCookie();

    return NextResponse.json(
      { success: true, message: 'Çıkış başarılı' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Çıkış işlemi başarısız' },
      { status: 500 }
    );
  }
}
