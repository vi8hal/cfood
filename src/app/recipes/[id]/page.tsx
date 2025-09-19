
import type { Recipe as RecipeType } from '@/lib/types';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Mail, MapPin, Phone } from 'lucide-react';
import React from 'react';
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
import SaveRecipeButton from '@/components/save-recipe-button';
import { pool } from '@/lib/db';

async function getRecipe(id: string): Promise<RecipeType | null> {
  try {
    const result = await pool.query(
      `SELECT
        r.id,
        r.title,
        r.description,
        r.ingredients,
        r.instructions,
        r.tags,
        r.preptime,
        r.cooktime,
        r.servings,
        r.price,
        r.contact,
        r.location,
        r.createdat,
        r.updatedat,
        u.id as "authorId",
        u.name as "authorName",
        u.email as "authorEmail",
        u.image as "authorImage",
        u.location as "authorLocation"
      FROM "Recipe" r
      JOIN "User" u ON r."authorId" = u.id
      WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const dbRecipe = result.rows[0];

    const recipe: RecipeType = {
        id: dbRecipe.id,
        title: dbRecipe.title,
        description: dbRecipe.description,
        ingredients: dbRecipe.ingredients,
        instructions: dbRecipe.instructions,
        tags: dbRecipe.tags || [],
        prepTime: dbRecipe.preptime,
        cookTime: dbRecipe.cooktime,
        servings: dbRecipe.servings,
        price: parseFloat(dbRecipe.price),
        createdAt: dbRecipe.createdat,
        updatedAt: dbRecipe.updatedat,
        authorId: dbRecipe.authorId,
        author: {
            id: dbRecipe.authorId,
            name: dbRecipe.authorName,
            email: dbRecipe.authorEmail,
            image: dbRecipe.authorImage,
            location: dbRecipe.authorLocation,
        },
        authorImage: dbRecipe.authorImage,
        contact: dbRecipe.contact,
        location: dbRecipe.location,
        // Mocked data for fields not in DB
        nutrition: { calories: 450, protein: 15, fat: 10, carbs: 75 },
        phone: '123-456-7890',
    };

    return recipe;
  } catch (error) {
    console.error("An error occurred while fetching the recipe:", error);
    return null;
  }
}

export default async function RecipePage({ params }: { params: { id: string } }) {
  const recipe = await getRecipe(params.id);

  if (!recipe) {
    notFound();
  }
  
  // Use a consistent placeholder based on recipe ID to avoid layout shifts
  const recipeImageSeed = parseInt(recipe.id, 16) % 1000;
  const recipeImage = { 
    src: `https://picsum.photos/seed/${recipeImageSeed}/600/400`,
    alt: `Image for ${recipe.title}`,
    hint: 'food plate' 
  };
  
  const { dummyOrders } = { dummyOrders: [
    { id: 'ORD001', user: 'Bob Johnson', timestamp: '2024-05-20 10:30 AM' },
    { id: 'ORD002', user: 'Charlie Brown', timestamp: '2024-05-20 11:15 AM' },
  ]};

  return (
    <div className="container mx-auto px-4 py-8 print-container">
      <header className="mb-8 no-print">
        <h1 className="text-4xl font-bold font-headline mb-2">{recipe.title}</h1>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-muted-foreground">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={recipe.authorImage || undefined} alt={recipe.author.name || ''} />
              <AvatarFallback>{(recipe.author.name || 'A').charAt(0)}</AvatarFallback>
            </Avatar>
            <span>By {recipe.author.name}</span>
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
          <SaveRecipeButton />
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
               {recipe.author.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href={`mailto:${recipe.author.email}`} className='font-medium hover:underline'>{recipe.author.email}</a>
                </div>
              )}
              {recipe.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span className='font-medium'>{recipe.phone}</span>
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
