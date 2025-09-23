
import { pool } from '@/lib/db';
import type { Recipe } from '@/lib/types';
import { RecipesClient } from '@/components/recipes-client';

async function getRecipes(): Promise<Recipe[]> {
  try {
    const result = await pool.query(`
      SELECT
        r.id, r.title, r.description, r.ingredients, r.instructions, r.tags,
        r.preptime, r.cooktime, r.servings, r.price, r.createdat, r.updatedat,
        u.id as "authorId", u.name as "authorName", u.email as "authorEmail",
        u.image as "authorImage", u.location as "authorLocation"
      FROM "Recipe" r
      JOIN "User" u ON r."authorId" = u.id
      ORDER BY r.createdat DESC
    `);

    return result.rows.map((dbRecipe) => ({
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
      location: dbRecipe.location,
    }));
  } catch (error) {
    console.error('An error occurred while fetching recipes:', error);
    return [];
  }
}


export default async function RecipesPage() {
  const recipes = await getRecipes();
  const allTags = ['all', ...Array.from(new Set(recipes.flatMap(r => r.tags || [])))];


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">Explore Recipes</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Find your next culinary adventure.
        </p>
      </div>

      <RecipesClient initialRecipes={recipes} allTags={allTags} />
    </div>
  );
}
