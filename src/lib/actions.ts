'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { pool } from './db';
import { createSession, deleteSession, getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { FormState } from './types';
import { revalidatePath } from 'next/cache';
import { users as mockUsers } from './placeholder-data';
import { RecipeSchema } from './schemas';


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
    const user = mockUsers.find((u) => u.email === email);
    
    if (!user) {
      return {
        status: 'error',
        message: 'Invalid credentials. Please try again.',
      };
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
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
  revalidatePath('/dashboard');
  redirect('/recipes');
}
