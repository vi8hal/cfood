
'use client';

export async function getSession() {
  try {
    const res = await fetch('/api/session');
    if (!res.ok) {
      return null;
    }
    const session = await res.json();
    // If the session is empty, return null
    if (Object.keys(session).length === 0) {
      return null;
    }
    return session;
  } catch (error) {
    console.error('Failed to fetch session:', error);
    return null;
  }
}
