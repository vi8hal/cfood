import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <div className="mx-auto bg-muted rounded-full p-4 w-fit">
                    <ChefHat className="h-12 w-12 text-muted-foreground" />
                </div>
                <CardTitle className="text-3xl font-headline mt-4">Recipe Not Found</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-6">
                    Sorry, we couldn't find the recipe you were looking for. It might have been moved or deleted.
                </p>
                <Button asChild>
                    <Link href="/recipes">Back to All Recipes</Link>
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
