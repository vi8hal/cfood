
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import placeholderImages from '@/lib/placeholder-images.json';
import { ChefHat, Search, Users } from 'lucide-react';

export default function LandingPage() {
  const heroImage = placeholderImages.hero;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="relative w-full h-[70vh] flex items-center justify-center text-center">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            data-ai-hint={heroImage.hint}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-headline font-bold text-white">
              Welcome to <span className="text-primary">Culinary Hub</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-200">
              The ultimate platform to discover, share, and enjoy homemade recipes from a vibrant community of food lovers.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/recipes">Explore Recipes</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/signup">Join the Community</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 font-headline">
              Why Culinary Hub?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-headline mb-2">Discover & Search</h3>
                <p className="text-muted-foreground">
                  Easily find recipes by name, ingredients, or even by location. Your next favorite meal is just a search away.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <ChefHat className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-headline mb-2">Share Your Creations</h3>
                <p className="text-muted-foreground">
                  Have a recipe to share? Our platform makes it simple to upload and showcase your culinary talents to the world.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-headline mb-2">Community Focused</h3>
                <p className="text-muted-foreground">
                  Connect with other food enthusiasts, order homemade meals, and be part of a growing community.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="cta" className="py-16 md:py-24 bg-secondary/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 font-headline">Ready to Get Cooking?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Join Culinary Hub today to start exploring thousands of recipes and share your own creations with a community that shares your passion.
            </p>
            <Button asChild size="lg">
              <Link href="/signup">Sign Up Now</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
