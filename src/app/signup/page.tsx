'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signUpAction } from '@/lib/actions';
import type { FormState } from '@/lib/types';
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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
      Create Account
    </Button>
  );
}

export default function SignupPage() {
  const { toast } = useToast();
  const [signUpState, signUpFormAction] = useActionState<FormState, FormData>(
    signUpAction,
    null
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors: formErrors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpSchema),
    mode: 'onBlur',
  });

  useEffect(() => {
    if (signUpState?.status === 'error') {
      if (signUpState.fieldErrors) {
        for (const [field, message] of Object.entries(
          signUpState.fieldErrors
        )) {
          setError(field as keyof SignUpFormValues, {
            type: 'server',
            message: message[0],
          });
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description: signUpState.message,
        });
      }
    }
  }, [signUpState, toast, setError]);


  const onSubmit = (data: SignUpFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
    });
    signUpFormAction(formData);
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/50">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
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
              <Input id="name" {...register('name')} />
              {formErrors.name && (
                <p className="text-sm text-destructive">
                  {formErrors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {formErrors.email && (
                <p className="text-sm text-destructive">
                  {formErrors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} />
              {formErrors.password && (
                <p className="text-sm text-destructive">
                  {formErrors.password.message}
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
              {formErrors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {formErrors.confirmPassword.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <SubmitButton />
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
