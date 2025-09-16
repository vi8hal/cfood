'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from './prisma';
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
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { status: 'error', message: 'User with this email already exists' };
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.oTP.create({
      data: {
        userId: user.id,
        code: otpCode,
        expiresAt: otpExpires,
      },
    });

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
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { status: 'error', message: 'User not found.' };
    }

    const otpRecord = await prisma.oTP.findFirst({
        where: {
            userId: user.id,
            code: otp,
            expiresAt: {
                gt: new Date(),
            }
        }
    });

    if (!otpRecord) {
        return { status: 'error', message: 'Invalid or expired OTP.' };
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
    });

    await prisma.oTP.delete({
        where: { id: otpRecord.id }
    });
    
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
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { status: 'error', message: 'Invalid email or password.' };
    }

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
