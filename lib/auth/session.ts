import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SESSION_SECRET = process.env.SESSION_SECRET || '';
const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds

interface SessionPayload {
  email: string;
  iat: number;
  exp: number;
}

const getSecretKey = () => {
  if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters');
  }
  return new TextEncoder().encode(SESSION_SECRET);
};

export async function createSession(email: string): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + SESSION_DURATION;

  const token = await new SignJWT({ email, iat, exp })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(getSecretKey());

  return token;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const verified = await jwtVerify(token, getSecretKey());
    const payload = verified.payload;
    
    // Validate payload structure
    if (
      typeof payload.email === 'string' &&
      typeof payload.iat === 'number' &&
      typeof payload.exp === 'number'
    ) {
      return {
        email: payload.email,
        iat: payload.iat,
        exp: payload.exp,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set('admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;

  if (!token) {
    return null;
  }

  return verifySession(token);
}
