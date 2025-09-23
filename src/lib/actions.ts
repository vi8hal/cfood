'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { pool } from './db';
import { sendVerificationEmail } from '@/lib/email';
import { createSession, deleteSession, getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { FormState } from './types';
import { revalidatePath } from 'next/cache';

export const RecipeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long.'),
  price: z.coerce
    .number()
    .min(0, "Price must be a positive number or 0 for free."),
  location: z.string().min(3, 'Location is required.'),
  contact: z.string().optional(),
  ingredients: z.string().min(10, 'Please list at least one ingredient.'),
  instructions: z
    .string()
    .min(20, 'Instructions must be at least 20 characters long.'),
  prepTime: z.coerce
    .number()
    .int()
    .positive('Prep time must be a positive number.'),
  cookTime: z.coerce
    .number()
    .int()
    .positive('Cook time must be a positive number.'),
  servings: z.coerce
    .number()
    .int()
    .positive('Servings must be a positive number.'),
});

const SignUpSchema = z
  .object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

export async function signUpAction(
  prevState: any,
  formData: FormData
): Promise<FormState> {
  const validatedFields = SignUpSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: 'Invalid form data. Please check the fields and try again.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const userResult = await client.query(
      `INSERT INTO "User" (name, email, password)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email`,
      [name, email, hashedPassword]
    );

    if (userResult.rows.length === 0) {
       return {
        status: 'error',
        message: 'A user with this email already exists.',
        fieldErrors: { email: ['A user with this email already exists.'] },
      };
    }

    const user = userResult.rows[0];

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await client.query(
      'INSERT INTO "OTP" ("userId", code, "expiresAt") VALUES ($1, $2, $3)',
      [user.id, otpCode, otpExpires]
    );

    await sendVerificationEmail(email, otpCode);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Sign-up failed for ${email}:`, error);
    return {
      status: 'error',
      message: 'An unexpected error occurred during sign-up.',
    };
  } finally {
    client.release();
  }

  redirect(`/verify-otp?email=${encodeURIComponent(email)}`);
}

const VerifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, { message: 'Your OTP must be 6 digits.' }),
});

export async function verifyOtpAction(
  prevState: any,
  formData: FormData
): Promise<FormState> {
  const validatedFields = VerifyOtpSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: 'Invalid OTP data.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, otp } = validatedFields.data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const userResult = await client.query(
      'SELECT * FROM "User" WHERE email = $1',
      [email]
    );
    if (userResult.rows.length === 0) {
      return { status: 'error', message: 'User not found.' };
    }
    const user = userResult.rows[0];

    const otpResult = await client.query(
      'SELECT * FROM "OTP" WHERE "userId" = $1 AND code = $2 AND "expiresAt" > NOW() ORDER BY "createdAt" DESC LIMIT 1',
      [user.id, otp]
    );

    if (otpResult.rows.length === 0) {
      return {
        status: 'error',
        message: 'Invalid or expired OTP.',
        fieldErrors: { otp: ['Invalid or expired OTP. Please try again.'] },
      };
    }
    const otpRecord = otpResult.rows[0];

    await client.query('UPDATE "User" SET "emailVerified" = NOW() WHERE id = $1', [
      user.id,
    ]);

    await client.query('DELETE FROM "OTP" WHERE id = $1', [otpRecord.id]);

    await createSession(user.id);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`OTP verification failed for ${email}:`, error);
    return {
      status: 'error',
      message: 'An unexpected error occurred during OTP verification.',
    };
  } finally {
    client.release();
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

const SignInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export async function signInAction(
  prevState: any,
  formData: FormData
): Promise<FormState> {
  const validatedFields = SignInSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: 'Invalid form data.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const userResult = await pool.query(
      'SELECT * FROM "User" WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return {
        status: 'error',
        message: 'Invalid credentials. Please try again.',
      };
    }

    const user = userResult.rows[0];
    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
      return {
        status: 'error',
        message: 'Invalid credentials. Please try again.',
      };
    }

    if (!user.emailVerified) {
      console.log(
        `User ${email} attempted login without verification. Redirecting to OTP.`
      );
      redirect(`/verify-otp?email=${encodeURIComponent(email)}&resend=true`);
    }

    await createSession(user.id);
  } catch (error) {
    console.error('Sign-in error:', error);
    return {
      status: 'error',
      message: 'An unexpected error occurred. Please try again.',
    };
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function signOutAction() {
  await deleteSession();
  revalidatePath('/', 'layout');
}

export async function createRecipeAction(
  prevState: any,
  formData: FormData
): Promise<FormState> {
  const session = await getSession();
  if (!session?.user?.id) {
    return {
      status: 'error',
      message: 'Authentication error. Please log in and try again.',
    };
  }
  const userId = session.user.id;

  const validatedFields = RecipeSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: 'Invalid form data. Please check the fields and try again.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const {
    title,
    description,
    price,
    location,
    contact,
    ingredients,
    instructions,
    prepTime,
    cookTime,
    servings,
  } = validatedFields.data;

  const ingredientsArray = ingredients
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => {
      const parts = line.trim().split(' ');
      const quantity = parts[0] || '';
      const item = parts.slice(1).join(' ').trim();
      return { quantity, item };
    });

  const instructionsArray = instructions
    .split('\n')
    .filter((line) => line.trim() !== '');

  try {
    await pool.query(
      `INSERT INTO "Recipe" (
        title, description, price, location, contact, ingredients, instructions, 
        preptime, cooktime, servings, "authorId"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        title,
        description,
        price,
        location,
        contact,
        JSON.stringify(ingredientsArray),
        instructionsArray,
        prepTime,
        cookTime,
        servings,
        userId,
      ]
    );
  } catch (error) {
    console.error('Failed to create recipe in database:', error);
    return {
      status: 'error',
      message: 'A database error occurred. Please try again later.',
    };
  }

  revalidatePath('/recipes');
  revalidatePath('/dashboard');
  redirect('/recipes');
}
