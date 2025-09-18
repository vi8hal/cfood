'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { signInAction } from '@/lib/actions';
import type { FormState } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
      Sign In
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState<FormState, FormData>(
    signInAction,
    null
  );
  const { toast } = useToast();

  useEffect(() => {
    if (state?.status === 'error') {
      toast({
        variant: 'destructive',
        title: 'Sign-In Failed',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/50">
      <Card className="w-full max-w-md">
        <form action={formAction}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <UtensilsCrossed className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl">
              Welcome Back
            </CardTitle>
            <CardDescription>
              Enter your credentials to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <SubmitButton />
            <p className="text-xs text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="underline hover:text-primary">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
