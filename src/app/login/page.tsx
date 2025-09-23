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
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

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
  const router = useRouter();
  const [state, formAction] = useActionState<FormState, FormData>(
    signInAction,
    null
  );
  const { toast } = useToast();

  useEffect(() => {
    if (state?.status === 'success') {
      toast({
        title: 'Sign-In Successful',
        description: state.message,
      });
      router.push('/dashboard');
    } else if (state?.status === 'error') {
      toast({
        variant: 'destructive',
        title: 'Sign-In Failed',
        description: state.message,
      });
    }
  }, [state, toast, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/50 p-4">
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
             <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Demo Accounts</AlertTitle>
              <AlertDescription>
                Use any email from our mock users (e.g., <code className="font-mono bg-muted px-1 py-0.5 rounded">alice@example.com</code>) with the password <code className="font-mono bg-muted px-1 py-0.5 rounded">password123</code>.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                defaultValue="alice@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required defaultValue="password123" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <SubmitButton />
             {state?.status === 'error' && (
                <p className="text-sm text-destructive text-center">{state.message}</p>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
