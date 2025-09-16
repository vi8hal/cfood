import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        r.id, r.title, r.description, r.ingredients, r.instructions, r.tags,
        r.prep_time, r.cook_time, r.servings, r.price,
        u.id as author_id, u.name as author_name, u.email as author_email, u.image as author_image, u.location as author_location
      FROM recipes r
      JOIN users u ON r.author_id = u.id
    `);
    
    const recipes = result.rows.map(recipe => ({
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      tags: recipe.tags,
      prepTime: recipe.prep_time,
      cookTime: recipe.cook_time,
      servings: recipe.servings,
      price: parseFloat(recipe.price),
      author: {
        id: recipe.author_id,
        name: recipe.author_name,
        email: recipe.author_email,
        image: recipe.author_image,
        location: recipe.author_location,
      },
      authorImage: recipe.author_image || `https://i.pravatar.cc/150?u=${recipe.author_email}`,
    }));

    return NextResponse.json({ recipes });
  } catch (error) {
    console.error("Failed to fetch recipes:", error);
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  } finally {
    client.release();
  }
}
