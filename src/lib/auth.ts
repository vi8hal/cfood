import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const secretKey = process.env.JWT_SECRET;
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h') // Extend session to 8 hours
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    // This will be caught if the token is invalid or expired
    console.error('JWT Decryption Error:', error);
    return null;
  }
}

export async function createSession(userId: string) {
  const expires = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours from now
  const session = await encrypt({ userId, expires });

  cookies().set('session', session, { expires, httpOnly: true, secure: process.env.NODE_ENV === 'production' });
}

export async function deleteSession() {
  // Set the cookie with an expiration date in the past to delete it
  cookies().set('session', '', { expires: new Date(0) });
}

// This function can be called from Server Components, Server Actions, and Route Handlers
export async function getSession() {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return null;
  return await decrypt(sessionCookie);
}

// This function is used in the middleware to refresh the session
export async function updateSession(request: NextRequest) {
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) return;
  
    const session = await decrypt(sessionCookie);
    if (!session) return;
  
    // Refresh the session expiration
    const newExpires = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours from now
    
    const newSession = await encrypt({ userId: session.userId, expires: newExpires });
    
    const response = NextResponse.next();
    response.cookies.set({
      name: 'session',
      value: newSession,
      expires: newExpires,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    return response;
  }
