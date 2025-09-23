
'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { pool } from './db';
import { createSession, deleteSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { FormState } from './types';
import { revalidatePath } from 'next/cache';
import { RecipeSchema } from './schemas';
import crypto from 'crypto';
import { sendVerificationEmail } from './email';

const SignInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const SignUpSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters.'),
    email: z.string().email('Please enter a valid email.'),
    password: z.string().min(8, 'Password must be at least 8 characters long.'),
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
    const result = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
        return { status: 'error', message: 'Invalid credentials. Please try again.' };
    }
    
    if (!user.emailVerified) {
        redirect(`/verify-otp?email=${encodeURIComponent(email)}`);
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return {
        status: 'error',
        message: 'Invalid credentials. Please try again.',
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

  revalidatePath('/dashboard');
  return { status: 'success', message: 'Sign-in successful!' };
}

export async function signOutAction() {
  await deleteSession();
  revalidatePath('/', 'layout');
}

export async function signUpAction(
  prevState: any,
  formData: FormData
): Promise<FormState> {
  const validatedFields = SignUpSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: 'Invalid form data.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const existingUser = await pool.query('SELECT id FROM "User" WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return { status: 'error', message: 'A user with this email already exists.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserResult = await pool.query(
      `INSERT INTO "User" (name, email, password) VALUES ($1, $2, $3) RETURNING id`,
      [name, email, hashedPassword]
    );
    const userId = newUserResult.rows[0].id;
    
    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool.query(
        `INSERT INTO "OTP" (code, "userId", expires) VALUES ($1, $2, $3)`,
        [otp, userId, otpExpires]
    );
    
    // Send OTP email
    await sendVerificationEmail(email, otp);

  } catch (error) {
    console.error('Sign-up error:', error);
    return { status: 'error', message: 'An error occurred during sign-up.' };
  }

  redirect(`/verify-otp?email=${encodeURIComponent(email)}`);
}

export async function verifyOtpAction(prevState: any, formData: FormData): Promise<FormState> {
    const email = formData.get('email') as string;
    const otp = formData.get('otp') as string;

    if (!email || !otp) {
        return { status: 'error', message: 'Email and OTP are required.' };
    }

    try {
        const userResult = await pool.query('SELECT id FROM "User" WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return { status: 'error', message: 'User not found.' };
        }
        const userId = userResult.rows[0].id;

        const otpResult = await pool.query(
            'SELECT * FROM "OTP" WHERE "userId" = $1 AND code = $2 AND expires > NOW() ORDER BY "createdAt" DESC LIMIT 1',
            [userId, otp]
        );

        if (otpResult.rows.length === 0) {
            return { status: 'error', message: 'Invalid or expired OTP.' };
        }
        
        const otpRecord = otpResult.rows[0];

        // Mark user as verified
        await pool.query('UPDATE "User" SET "emailVerified" = NOW() WHERE id = $1', [userId]);

        // Delete the used OTP
        await pool.query('DELETE FROM "OTP" WHERE id = $1', [otpRecord.id]);

        // Create session for the user
        await createSession(userId);

    } catch (error) {
        console.error('OTP verification error:', error);
        return { status: 'error', message: 'An unexpected error occurred.' };
    }
    
    revalidatePath('/dashboard');
    return { status: 'success', message: 'Account verified successfully!' };
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
      // Split on the first space to separate quantity from item
      const firstSpaceIndex = line.trim().indexOf(' ');
      if (firstSpaceIndex === -1) {
        return { quantity: '', item: line.trim() };
      }
      const quantity = line.trim().substring(0, firstSpaceIndex);
      const item = line.trim().substring(firstSpaceIndex + 1);
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
  redirect('/recipes');
}

import { getSession } from '@/lib/auth';
