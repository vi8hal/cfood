
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signUpAction, verifyOtpAction } from '@/lib/actions';
import { FormState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UtensilsCrossed, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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

type SignUpFormValues = z.infer<typeof SignUpSchema>;

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
      {text}
    </Button>
  );
}

export default function SignupPage() {
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState('');
  const { toast } = useToast();

  const [signUpState, signUpFormAction] = useActionState<FormState, FormData>(
    signUpAction,
    null
  );

  const [verifyOtpState, verifyOtpFormAction] = useActionState<
    FormState,
    FormData
  >(verifyOtpAction, null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpSchema),
  });

  useEffect(() => {
    if (signUpState?.status === 'success') {
      toast({
        title: 'Registration Successful',
        description: signUpState.message,
      });
      const formData = new FormData(document.querySelector('form')!);
      setEmailForOtp(formData.get('email') as string);
      setShowOtpForm(true);
    } else if (signUpState?.status === 'error') {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: signUpState.message,
      });
    }
  }, [signUpState, toast]);

  useEffect(() => {
    if (verifyOtpState?.status === 'error') {
        toast({
            variant: 'destructive',
            title: 'Verification Failed',
            description: verifyOtpState.message,
        });
    }
  }, [verifyOtpState, toast]);

  if (showOtpForm) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary/50">
        <Card className="w-full max-w-md">
          <form action={verifyOtpFormAction}>
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-3xl">
                Verify Your Email
              </CardTitle>
              <CardDescription>
                Enter the 6-digit code sent to {emailForOtp}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input type="hidden" name="email" value={emailForOtp} />
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <SubmitButton text="Verify Account" />
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/50">
      <Card className="w-full max-w-md">
        <form action={signUpFormAction} onSubmit={handleSubmit((data) => {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, value);
            });
            signUpFormAction(formData);
        })}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <UtensilsCrossed className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl">
              Create an Account
            </CardTitle>
            <CardDescription>
              Join the Culinary Hub community to share and discover recipes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <SubmitButton text="Sign Up" />
            <p className="text-xs text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="underline hover:text-primary">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
