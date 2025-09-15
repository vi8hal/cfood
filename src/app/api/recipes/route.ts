import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        author: true,
      },
    });
    
    const parsedRecipes = recipes.map(recipe => ({
        ...recipe,
        ingredients: JSON.parse(recipe.ingredients as string),
        instructions: JSON.parse(recipe.instructions as string),
        tags: JSON.parse(recipe.tags as string),
        authorImage: `https://i.pravatar.cc/150?u=${recipe.author.email}`,
    }));

    return NextResponse.json({ recipes: parsedRecipes });
  } catch (error) {
    console.error("Failed to fetch recipes:", error);
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  }
}
