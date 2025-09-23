
import {SignJWT, jwtVerify} from 'jose';
import {cookies} from 'next/headers';
import {NextRequest, NextResponse} from 'next/server';
import type {SessionPayload, User} from '@/lib/types';
import {pool} from './db';
import { users as mockUsers } from './placeholder-data';


const secretKey = process.env.JWT_SECRET;
const key = new TextEncoder().encode(secretKey!);
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
  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.set('session', '', {expires: new Date(0)});
}

export async function getSession(): Promise<{
  user: User;
} | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  if (!sessionCookie) return null;

  const sessionPayload = await decrypt(sessionCookie);
  if (!sessionPayload?.userId) {
    return null;
  }

  try {
    // First, check the database for a real user
    const result = await pool.query('SELECT * FROM "User" WHERE id = $1', [
      sessionPayload.userId,
    ]);
    let user = result.rows[0];

    // If no user is found in the database, check the mock users
    if (!user) {
        const mockUser = mockUsers.find(u => u.id === sessionPayload.userId);
        if (mockUser) {
            user = {
                ...mockUser,
                createdat: new Date(), // Mock date
                updatedat: new Date(), // Mock date
                emailVerified: new Date(), // Mock as verified
            }
        }
    }

    if (!user) {
      return null;
    }

    // Omit password from the user object returned to the app
    const { password, ...userWithoutPassword } = user;

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        location: user.location,
        emailVerified: user.emailVerified,
        createdAt: user.createdat,
        updatedAt: user.updatedat,
      },
    };
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
