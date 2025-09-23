'use client';

import { useActionState, useEffect, Suspense } from 'react';
import { useFormStatus } from 'react-dom';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyOtpAction } from '@/lib/actions';
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
import { MailCheck, LoaderCircle } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
      Verify Account
    </Button>
  );
}

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [state, formAction] = useActionState<FormState, FormData>(
    verifyOtpAction,
    null
  );
  const { toast } = useToast();

  useEffect(() => {
    if (state?.status === 'success') {
      toast({
        title: 'Verification Successful',
        description: 'Your account has been verified. Welcome!',
      });
      router.push('/dashboard');
    } else if (state?.status === 'error' && state.message) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: state.message,
      });
    }
  }, [state, toast, router]);

  if (!email) {
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-destructive">No email address provided. Please start the sign-up process again.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <form action={formAction}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <MailCheck className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl">
            Check Your Email
          </CardTitle>
          <CardDescription>
            We&apos;ve sent a 6-digit verification code to <span className="font-semibold text-foreground">{email}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input type="hidden" name="email" value={email} />
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton />
          {state?.status === 'error' && state.message && (
            <p className="text-sm text-destructive text-center">{state.message}</p>

          )}
        </CardFooter>
      </form>
    </Card>
  );
}


export default function VerifyOtpPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary/50 p-4">
            <Suspense fallback={<div>Loading...</div>}>
                <VerifyOtpForm />
            </Suspense>
        </div>
    )
}
