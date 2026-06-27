import { NextRequest, NextResponse } from 'next/server';
import { createSession, setSessionCookie } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email ve şifre gerekli' },
        { status: 400 }
      );
    }

    // Check credentials against environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const sessionSecret = process.env.SESSION_SECRET;

    if (!adminEmail || !adminPassword) {
      console.error('Admin credentials not configured');
      return NextResponse.json(
        { success: false, error: 'Sunucu yapılandırma hatası' },
        { status: 500 }
      );
    }

    if (!sessionSecret || sessionSecret.length < 32) {
      console.error('SESSION_SECRET is not configured or too short');
      return NextResponse.json(
        { success: false, error: 'Sunucu yapılandırma hatası: SESSION_SECRET eksik' },
        { status: 500 }
      );
    }

    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    // Create session token
    const token = await createSession(email);

    // Set session cookie
    await setSessionCookie(token);

    return NextResponse.json(
      { success: true, message: 'Giriş başarılı' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Giriş işlemi başarısız' },
      { status: 500 }
    );
  }
}
