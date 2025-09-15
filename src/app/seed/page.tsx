'use client';

import { useActionState } from 'react';
import { seedDatabase } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoaderCircle, Database } from 'lucide-react';
import { useFormStatus } from 'react-dom';

const initialState = {
  message: '',
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Database className="mr-2 h-4 w-4" />
      )}
      Seed Database
    </Button>
  );
}

export default function SeedPage() {
  const [state, formAction] = useActionState(seedDatabase, initialState);

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Database Seeding</CardTitle>
          <CardDescription>
            Click the button below to populate your database with 10 mock users
            and 10 mock recipes. This will wipe any existing user and recipe
            data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <SubmitButton />
          </form>
          {state.message && (
            <div
              className={`mt-4 text-center text-sm ${
                state.error ? 'text-destructive' : 'text-muted-foreground'
              }`}
            >
              <p>{state.message}</p>
              {state.error && <p className="mt-2 text-xs">{state.error}</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
