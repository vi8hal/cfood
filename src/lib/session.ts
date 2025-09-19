// This file is deprecated and will be removed.
// All session logic is now centralized in src/lib/auth.ts
// The client-side `getSession` is replaced by the server-side `getSession` from `auth.ts`
// and a new API route `/api/session` that uses it.

'use client';

// This function is deprecated. Use the server-side `getSession` from `lib/auth.ts` instead.
export async function getClientSession() {
  try {
    const res = await fetch('/api/session', {cache: 'no-store'});
    if (!res.ok) {
      return null;
    }
    const session = await res.json();
    // If the session is an empty object, it means no user is logged in
    if (Object.keys(session).length === 0) {
      return null;
    }
    return session;
  } catch (error) {
    console.error('Failed to fetch client session:', error);
    return null;
  }
}
