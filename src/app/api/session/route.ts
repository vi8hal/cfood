import { getSession } from '@/lib/auth';
import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      // Return an empty object if there is no session, client will handle it.
      return NextResponse.json({});
    }

    // Optionally: fetch user details to enrich the session object for the client
    const userResult = await pool.query('SELECT id, name, email, image FROM "User" WHERE id = $1', [session.userId]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({});
    }

    const user = userResult.rows[0];
    
    // Return the session object along with user details
    return NextResponse.json({ 
      userId: session.userId,
      expires: session.expires,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image
      }
    });

  } catch (error) {
    console.error('Failed to get session:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
