import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { RecipeCard } from '@/components/recipe-card';
import { recipes } from '@/lib/data';
import AiRecommendations from '@/components/ai-recommendations';
import placeholderImages from '@/lib/placeholder-images.json';

export default function Home() {
  const featuredRecipes = recipes.slice(0, 6);

  return (
    <div className="flex flex-col">
      <section className="relative w-full h-[60vh] md:h-[70vh]">
        <Image
          src={placeholderImages.hero.src}
          alt={placeholderImages.hero.alt}
          data-ai-hint={placeholderImages.hero.hint}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center">
          <div className="bg-background/80 dark:bg-background/60 backdrop-blur-sm p-8 rounded-lg">
            <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary">
              Culinary Hub
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-2xl text-foreground">
              Share, discover, and plan your next favorite meal.
            </p>
            <div className="mt-8 flex w-full max-w-md mx-auto items-center space-x-2">
              <Input
                type="text"
                placeholder="Search for a recipe..."
                className="flex-1"
                aria-label="Search for a recipe"
              />
              <Button type="submit" size="icon" aria-label="Search">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="featured-recipes" className="py-12 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 font-headline">
            Featured Recipes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="outline">
              <Link href="/recipes">View All Recipes</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="ai-discovery" className="bg-secondary/50 py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
             <Card>
              <CardContent className="p-6">
                <AiRecommendations />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
