'use client';

import { useActionState, useEffect, Suspense } from 'react';
import { useFormStatus } from 'react-dom';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyOtpAction } from '@/lib/actions';
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
import { LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const email = searchParams.get('email');
  const { toast } = useToast();

  const [verifyOtpState, verifyOtpFormAction] = useActionState<
    FormState,
    FormData
  >(verifyOtpAction, null);

  useEffect(() => {
    if (verifyOtpState?.status === 'success') {
      toast({
        title: 'Verification Successful',
        description: verifyOtpState.message,
      });
      router.push('/dashboard');
    } else if (verifyOtpState?.status === 'error') {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: verifyOtpState.message,
      });
    }
  }, [verifyOtpState, toast, router]);

  useEffect(() => {
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Email is missing. Please sign up again.',
      });
      router.push('/signup');
    }
  }, [email, router, toast]);

  if (!email) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/50">
      <Card className="w-full max-w-md">
        <form action={verifyOtpFormAction}>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl">
              Verify Your Email
            </CardTitle>
            <CardDescription>
              Enter the 6-digit code sent to {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="hidden" name="email" value={email} />
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                name="otp"
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                autoFocus
              />
            </div>
            {verifyOtpState?.fieldErrors?.otp && (
              <p className="text-sm text-destructive">
                {verifyOtpState.fieldErrors.otp}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}


export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyOtpForm />
        </Suspense>
    )
}
