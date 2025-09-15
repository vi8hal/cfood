import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Recipe } from '@/lib/types';
import { Clock, DollarSign } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  // Use a consistent placeholder based on recipe ID to avoid layout shifts
  const recipeImageSeed = parseInt(recipe.id, 16) % 1000;
  const recipeImage = { 
    src: `https://picsum.photos/seed/${recipeImageSeed}/600/400`,
    alt: `Image for ${recipe.title}`,
    hint: 'food plate',
    width: 600,
    height: 400
  };

  return (
    <Link href={`/recipes/${recipe.id}`} className="group">
      <Card className="h-full overflow-hidden transition-all group-hover:shadow-lg group-hover:-translate-y-1 duration-300 flex flex-col">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={recipeImage.src}
              alt={recipeImage.alt}
              data-ai-hint={recipeImage.hint}
              width={recipeImage.width}
              height={recipeImage.height}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <div className="flex space-x-2 mb-2">
            {recipe.tags.slice(0, 2).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>
          <CardTitle className="text-xl font-headline leading-tight group-hover:text-primary transition-colors">
            {recipe.title}
          </CardTitle>
        </CardContent>
        <CardFooter className="p-4 flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={recipe.authorImage} alt={recipe.author.name || ''} />
              <AvatarFallback>{(recipe.author.name || 'U').charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{recipe.author.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-primary" />
              <span className="font-semibold">{recipe.price.toFixed(2)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{recipe.prepTime + recipe.cookTime} min</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
