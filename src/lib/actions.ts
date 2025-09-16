'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { pool } from './db';
import { sendVerificationEmail } from '@/lib/email';
import { createSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

const SignUpSchema = z
  .object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.string().email({ message: 'Please enter a valid email' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export async function signUpAction(prevState: any, formData: FormData) {
  const validatedFields = SignUpSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: 'Invalid form data',
      errors: validatedFields.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const existingUserResult = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
    if (existingUserResult.rows.length > 0) {
      return { status: 'error', message: 'User with this email already exists' };
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const userResult = await pool.query(
        'INSERT INTO "User" (name, email, password) VALUES ($1, $2, $3) RETURNING id',
        [name, email, hashedPassword]
      );
    const user = userResult.rows[0];

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool.query(
        'INSERT INTO "OTP" ("userId", code, "expiresAt") VALUES ($1, $2, $3)',
        [user.id, otpCode, otpExpires]
    );

    await sendVerificationEmail(email, otpCode);

    return {
      status: 'success',
      message: `A verification code has been sent to ${email}.`,
    };
  } catch (error) {
    console.error('Sign-up failed:', error);
    return {
      status: 'error',
      message: 'An unexpected error occurred during sign-up.',
    };
  }
}

const VerifyOtpSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6, { message: "OTP must be 6 digits" }),
});

export async function verifyOtpAction(prevState: any, formData: FormData) {
  const validatedFields = VerifyOtpSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: 'Invalid OTP data',
      errors: validatedFields.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    };
  }
  
  const { email, otp } = validatedFields.data;
  
  try {
    const userResult = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return { status: 'error', message: 'User not found.' };
    }
    const user = userResult.rows[0];

    const otpResult = await pool.query(
        'SELECT * FROM "OTP" WHERE "userId" = $1 AND code = $2 AND "expiresAt" > NOW()',
        [user.id, otp]
    );

    if (otpResult.rows.length === 0) {
        return { status: 'error', message: 'Invalid or expired OTP.' };
    }
    const otpRecord = otpResult.rows[0];

    await pool.query('UPDATE "User" SET "emailVerified" = NOW() WHERE id = $1', [user.id]);

    await pool.query('DELETE FROM "OTP" WHERE id = $1', [otpRecord.id]);
    
    await createSession(user.id);
    
  } catch (error) {
    console.error('OTP verification failed:', error);
    return {
      status: 'error',
      message: 'An unexpected error occurred during OTP verification.',
    };
  }
  redirect('/dashboard');
}

const SignInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});


export async function signInAction(prevState: any, formData: FormData) {
  const validatedFields = SignInSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: 'Invalid form data',
      errors: validatedFields.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const userResult = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      return { status: 'error', message: 'Invalid email or password.' };
    }

    const user = userResult.rows[0];
    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
      return { status: 'error', message: 'Invalid email or password.' };
    }
    
    if (!user.emailVerified) {
        return {
            status: 'error',
            message: 'Email not verified. Please check your inbox for the verification code.',
        };
    }

    await createSession(user.id);

  } catch (error) {
    console.error('Sign-in error:', error);
    return {
      status: 'error',
      message: 'An unexpected error occurred. Please try again.',
    };
  }

  redirect('/dashboard');
}


export async function signOutAction() {
    // This action would clear the session cookie
    // Implementation depends on the auth library used
    // For now, we'll simulate by redirecting
    redirect('/login');
}
