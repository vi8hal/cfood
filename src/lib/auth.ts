
import {SignJWT, jwtVerify} from 'jose';
import {cookies} from 'next/headers';
import {NextRequest, NextResponse} from 'next/server';
import type {SessionPayload, User} from '@/lib/types';
import {pool} from './db';

const secretKey = process.env.JWT_SECRET;
const key = new TextEncoder().encode(secretKey);
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({alg: 'HS256'})
    .setIssuedAt()
    .setExpirationTime('8h') // Token expiration
    .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const {payload} = await jwtVerify<SessionPayload>(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    console.error('JWT Decryption Error:', error);
    return null;
  }
}

export async function createSession(userId: string) {
  const expires = new Date(Date.now() + SESSION_DURATION);
  const session = await encrypt({userId, expires: expires.toISOString()});

  (await cookies()).set('session', session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function deleteSession() {
  (await cookies()).set('session', '', {expires: new Date(0)});
}

export async function getSession(): Promise<{
  user: User;
} | null> {
  const sessionCookie = (await cookies()).get('session')?.value;
  if (!sessionCookie) return null;

  const sessionPayload = await decrypt(sessionCookie);
  if (!sessionPayload?.userId) {
    return null;
  }

  try {
    const userResult = await pool.query(
      'SELECT id, name, email, image, location, createdat as "createdAt", updatedat as "updatedAt", emailVerified FROM "User" WHERE id = $1',
      [sessionPayload.userId]
    );
    if (userResult.rows.length === 0) {
      return null;
    }
    const user: User = userResult.rows[0];
    return {user};
  } catch (error) {
    console.error('Failed to fetch user for session:', error);
    return null;
  }
}

export async function updateSession(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  if (!sessionCookie) return;

  const session = await decrypt(sessionCookie);
  if (!session?.userId) return;

  // Refresh the session expiration
  const newExpires = new Date(Date.now() + SESSION_DURATION);
  const newSessionToken = await encrypt({
    userId: session.userId,
    expires: newExpires.toISOString(),
  });

  const response = NextResponse.next();
  response.cookies.set({
    name: 'session',
    value: newSessionToken,
    expires: newExpires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}
