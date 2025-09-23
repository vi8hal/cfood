require('dotenv').config({ path: '.env' });

import { Pool } from 'pg';
import { recipes as placeholderRecipes, users as placeholderUsers } from '../src/lib/placeholder-data';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

async function setupTables(client: Pool) {
  try {
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    // Create User table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        image VARCHAR(255),
        location VARCHAR(255),
        "emailVerified" TIMESTAMPTZ,
        "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log(`Ensured "User" table exists.`);

    // Create Recipe table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Recipe" (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        ingredients JSONB,
        instructions TEXT[],
        tags TEXT[],
        "prepTime" INTEGER,
        "cookTime" INTEGER,
        servings INTEGER,
        price NUMERIC(10, 2),
        "authorId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        location VARCHAR(255),
        contact VARCHAR(255)
      );
    `);
    console.log(`Ensured "Recipe" table exists.`);

    // Create OTP table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "OTP" (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          code VARCHAR(6) NOT NULL,
          "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
          expires TIMESTAMPTZ NOT NULL,
          "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log(`Ensured "OTP" table exists.`);

  } catch (error) {
    console.error('Error setting up tables:', error);
    throw error;
  }
}

async function seedUsers(client: Pool) {
  const userCountRes = await client.query('SELECT COUNT(*) FROM "User"');
  if (parseInt(userCountRes.rows[0].count, 10) > 0) {
    console.log('User table is not empty. Skipping user seeding.');
    return;
  }

  console.log('Seeding users...');
  const insertedUsers = await Promise.all(
    placeholderUsers.map(async (user) => {
      return client.query(
        `
        INSERT INTO "User" (id, name, email, password, image, location)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING;
      `,
        [user.id, user.name, user.email, user.password, user.image, user.location]
      );
    })
  );
  console.log(`Seeded ${insertedUsers.length} users.`);
}


async function seedRecipes(client: Pool) {
    const recipeCountRes = await client.query('SELECT COUNT(*) FROM "Recipe"');
    if (parseInt(recipeCountRes.rows[0].count, 10) > 0) {
        console.log("Recipe table is not empty. Skipping recipe seeding.");
        return;
    }

    console.log(`Seeding recipes...`);
      const insertedRecipes = await Promise.all(
        placeholderRecipes.map(async (recipe) => {
          return client.query(
            `
            INSERT INTO "Recipe" (title, description, ingredients, instructions, tags, "prepTime", "cookTime", servings, price, "authorId", location)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, (SELECT location FROM "User" WHERE id = $10))
            ON CONFLICT (id) DO NOTHING;
          `,
            [
              recipe.title,
              recipe.description,
              JSON.stringify(recipe.ingredients),
              recipe.instructions,
              recipe.tags,
              recipe.prepTime,
              recipe.cookTime,
              recipe.servings,
              recipe.price,
              recipe.authorId,
            ]
          );
        }),
      );
  
      console.log(`Seeded ${insertedRecipes.filter(Boolean).length} recipes`);
}


async function main() {
  const client = await pool.connect();

  try {
    // We create tables first to ensure they exist.
    await setupTables(pool);
    // Then we seed the initial data if the tables are empty.
    await seedUsers(pool);
    await seedRecipes(pool);
    
    console.log("Database seeding completed successfully.");

  } catch (error) {
    console.error(
      'An error occurred while attempting to seed the database:',
      error,
    );
  } finally {
    await client.release();
    await pool.end();
  }
}

main();
