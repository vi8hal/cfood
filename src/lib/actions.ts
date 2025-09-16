
'use server';

import {getPersonalizedRecipeRecommendations} from '@/ai/flows/personalized-recipe-recommendations';
import {z} from 'zod';
import {pool} from '@/lib/db';
import {users, recipes} from '@/lib/placeholder-data';
import bcrypt from 'bcryptjs';

const recommendationSchema = z.object({
  dietaryPreferences: z.string().optional(),
  availableIngredients: z.string(),
});

export async function getRecommendations(prevState: any, formData: FormData) {
  const validatedFields = recommendationSchema.safeParse({
    dietaryPreferences: formData.get('dietaryPreferences'),
    availableIngredients: formData.get('availableIngredients'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      recommendations: [],
    };
  }

  const {dietaryPreferences, availableIngredients} = validatedFields.data;

  try {
    const result = await getPersonalizedRecipeRecommendations({
      dietaryPreferences: dietaryPreferences
        ? dietaryPreferences.split(',').map(s => s.trim())
        : [],
      availableIngredients: availableIngredients
        .split(',')
        .map(s => s.trim()),
      pastInteractions: ['liked Spicy Tomato Pasta'], // Mocked data
      location: 'San Francisco, CA', // Mocked data
    });

    return {
      message: 'Recommendations generated!',
      recommendations: result.recommendedRecipes,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Failed to generate recommendations.',
      recommendations: [],
    };
  }
}

export async function seedDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Seeding database...');

    // Drop tables if they exist
    await client.query('DROP TABLE IF EXISTS recipes CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    console.log('Dropped existing tables.');

    // Create users table
    await client.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        image VARCHAR(255),
        location VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created "users" table.');

    // Create recipes table
    await client.query(`
      CREATE TABLE recipes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        ingredients JSON NOT NULL,
        instructions JSON NOT NULL,
        tags JSON NOT NULL,
        prep_time INTEGER NOT NULL,
        cook_time INTEGER NOT NULL,
        servings INTEGER NOT NULL,
        author_id UUID NOT NULL REFERENCES users(id),
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created "recipes" table.');

    // Insert users
    const insertedUsers = [];
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const res = await client.query(
        `
        INSERT INTO users (name, email, password, image, location)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name;
      `,
        [user.name, user.email, hashedPassword, user.image, user.location]
      );
      insertedUsers.push(res.rows[0]);
    }
    console.log(`Seeded ${insertedUsers.length} users.`);

    // Insert recipes
    for (const recipe of recipes) {
      // Find the corresponding author's ID from the inserted users
      const author = insertedUsers.find(u => u.name === recipe.authorName);
      if (!author) {
        console.warn(
          `Could not find author "${recipe.authorName}" for recipe "${recipe.title}". Skipping.`
        );
        continue;
      }

      await client.query(
        `
        INSERT INTO recipes (title, description, ingredients, instructions, tags, prep_time, cook_time, servings, author_id, price)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
        [
          recipe.title,
          recipe.description,
          JSON.stringify(recipe.ingredients),
          JSON.stringify(recipe.instructions),
          JSON.stringify(recipe.tags),
          recipe.prepTime,
          recipe.cookTime,
          recipe.servings,
          author.id,
          recipe.price,
        ]
      );
    }
    console.log(`Seeded ${recipes.length} recipes.`);

    await client.query('COMMIT');
    return {
      message:
        'Database seeding completed successfully. Tables created and populated.',
      error: null,
    };
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Database seeding failed:', error);
    return {
      message: 'Database seeding failed.',
      error: error.message || 'An unknown error occurred.',
    };
  } finally {
    client.release();
  }
}
