import { recipes, dummyOrders } from '@/lib/data';
import type { Recipe } from '@/lib/types';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Mail, MapPin } from 'lucide-react';
import React from 'react';
import RecipePrintButton from '@/components/recipe-print-button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RecipeMetadata } from '@/components/recipe-metadata';
import { RecipeDetails } from '@/components/recipe-details';
import { NutritionFacts } from '@/components/nutrition-facts';
import placeholderImages from '@/lib/placeholder-images.json';

function getRecipe(id: string): Recipe | undefined {
  return recipes.find((recipe) => recipe.id === id);
}

export default function RecipePage({ params }: { params: { id: string } }) {
  const recipe = getRecipe(params.id);

  if (!recipe) {
    notFound();
  }
  
  const recipeImage = (placeholderImages.recipes as any)[recipe.id] || { src: 'https://picsum.photos/seed/1/600/400', alt: 'Placeholder', hint: 'food' };

  return (
    <div className="container mx-auto px-4 py-8 print-container">
      <header className="mb-8 no-print">
        <h1 className="text-4xl font-bold font-headline mb-2">{recipe.title}</h1>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-muted-foreground">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={recipe.authorImage} alt={recipe.author} />
              <AvatarFallback>{recipe.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>By {recipe.author}</span>
          </div>
          <div className="flex items-center text-2xl font-bold text-primary">
            <DollarSign className="h-6 w-6 mr-1" />
            <span>{recipe.price.toFixed(2)}</span>
          </div>
        </div>
      </header>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg">
            <Image
              src={recipeImage.src}
              alt={recipe.title}
              data-ai-hint={recipeImage.hint}
              fill
              className="object-cover"
            />
          </div>

          <p className="text-lg">{recipe.description}</p>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside grid sm:grid-cols-2 gap-x-8 gap-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="text-base">
                    <span className="font-semibold">{ingredient.quantity}</span> {ingredient.item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-outside pl-5 space-y-4">
                {recipe.instructions.map((step, index) => (
                  <li key={index} className="text-base leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card className="no-print">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Order History</CardTitle>
              <p className="text-sm text-muted-foreground">Recent orders for this recipe.</p>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Timestamp</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dummyOrders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.id}</TableCell>
                                <TableCell>{order.user}</TableCell>
                                <TableCell>{order.timestamp}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>

        </div>

        <aside className="space-y-8 md:col-span-1">
          <RecipePrintButton />
          <RecipeMetadata recipe={recipe} />
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Contact & Pickup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recipe.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className='font-medium'>{recipe.location}</span>
                </div>
              )}
              {recipe.contact && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href={`mailto:${recipe.contact}`} className='font-medium hover:underline'>{recipe.contact}</a>
                </div>
              )}
            </CardContent>
          </Card>
          <RecipeDetails tags={recipe.tags} />
          <NutritionFacts nutrition={recipe.nutrition} />
        </aside>
      </div>
    </div>
  );
}
