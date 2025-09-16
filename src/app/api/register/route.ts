import {NextResponse} from 'next/server';
import bcrypt from 'bcryptjs';
import {pool} from '@/lib/db';

export async function POST(req: Request) {
  try {
    const {name, email, password} = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        {error: 'Missing required fields'},
        {status: 400}
      );
    }

    const client = await pool.connect();
    try {
      const existingUser = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          {error: 'User with this email already exists'},
          {status: 409}
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await client.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, image',
        [name, email, hashedPassword]
      );

      const newUser = result.rows[0];

      return NextResponse.json({user: newUser});
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Registration failed:', error);
    return NextResponse.json(
      {error: 'An unexpected error occurred during registration.'},
      {status: 500}
    );
  }
}
