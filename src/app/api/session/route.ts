
import { getSession as getServerSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({});
    }
    return NextResponse.json(session);
  } catch (error) {
    console.error('Failed to get session:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
