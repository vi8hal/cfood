require('dotenv').config({ path: '.env.local' });

import { Pool } from 'pg';
import { recipes as placeholderRecipes } from '../src/lib/placeholder-data';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

async function setupTables(client: Pool) {
  try {
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    // Drop tables with CASCADE to handle dependencies
    await client.query(`DROP TABLE IF EXISTS "User" CASCADE;`);
    console.log('Dropped "User" table and dependent tables.');
    await client.query(`DROP TABLE IF EXISTS "OTP";`); // Drop OTP separately in case User drop fails
    console.log('Dropped "OTP" table.');


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
    console.log(`Created "User" table`);

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
    console.log(`Created "Recipe" table`);

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
    console.log(`Created "OTP" table`);

  } catch (error) {
    console.error('Error setting up tables:', error);
    throw error;
  }
}

// Optional: a function to seed recipes if there are users in the db.
// This is separate because we are not seeding users anymore.
async function seedRecipesIfUsersExist(client: Pool) {
    const userCountRes = await client.query('SELECT COUNT(*) FROM "User"');
    const userCount = parseInt(userCountRes.rows[0].count, 10);
    
    if (userCount === 0) {
        console.log("User table is empty. Skipping recipe seeding.");
        return;
    }

    console.log(`${userCount} users found. Seeding recipes.`);
     const recipeCount = await client.query('SELECT COUNT(*) FROM "Recipe"');
      if (parseInt(recipeCount.rows[0].count, 10) > 0) {
          console.log('Recipes table is not empty. Skipping seeding recipes.');
          return;
      }
      
      const usersResult = await client.query('SELECT * from "User"');
      const dbUsers = usersResult.rows;

      const insertedRecipes = await Promise.all(
        placeholderRecipes.map(async (recipe) => {
          // This will now use the pre-seeded mock users
          const author = dbUsers.find(u => u.name === recipe.authorName);
          if (!author) {
            console.warn(`Author "${recipe.authorName}" not found for recipe "${recipe.title}". Skipping.`);
            return;
          }
          
          return client.query(
            `
            INSERT INTO "Recipe" (title, description, ingredients, instructions, tags, "prepTime", "cookTime", servings, price, "authorId", location)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
              author.id,
              author.location, // Use author's location for the recipe location
            ]
          );
        }),
      );
  
      console.log(`Seeded ${insertedRecipes.filter(Boolean).length} recipes`);
}


async function main() {
  const client = await pool.connect();

  try {
    await setupTables(pool);
    // Note: We no longer seed users here, as the sign-in can handle mock users
    // and the sign-up handles real users.
    console.log("Database tables are set up. The application is ready for user sign-ups.");
    console.log("You can also log in using one of the mock accounts from placeholder-data.ts.");

    // You could optionally seed some initial data here if needed, for example, recipes for mock users
    // if you first seed the mock users. But based on the prompt, we keep it clean.

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
