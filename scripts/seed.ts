require('dotenv').config({ path: '.env.local' });

import { Pool } from 'pg';
import { users, recipes as placeholderRecipes } from '../src/lib/placeholder-data';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

async function seedUsers(client: Pool) {
  try {
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    // Create the "User" table if it doesn't exist
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

    // Insert data into the "User" table
    const insertedUsers = await Promise.all(
      users.map(async (user) => {
        const result = await client.query(
          `
          INSERT INTO "User" (id, name, email, password, image, location, "emailVerified")
          VALUES ($1, $2, $3, $4, $5, $6, NOW())
          ON CONFLICT (email) DO NOTHING
          RETURNING *;
        `,
          [user.id, user.name, user.email, user.password, user.image, user.location]
        );
        return result.rows[0];
      }),
    );

    console.log(`Seeded ${insertedUsers.filter(Boolean).length} users`);
    return insertedUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

async function seedRecipes(client: Pool) {
    try {
      await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  
      // Create the "Recipe" table if it doesn't exist
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
          "authorId" UUID NOT NULL REFERENCES "User"(id),
          "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          location VARCHAR(255),
          contact VARCHAR(255)
        );
      `);
  
      console.log(`Created "Recipe" table`);
  
      // Get users to associate recipes with
      const usersResult = await client.query('SELECT * from "User"');
      const dbUsers = usersResult.rows;

      if (dbUsers.length === 0) {
        console.warn("No users found in DB. Cannot seed recipes.");
        return;
      }
  
      // Insert data into the "Recipe" table
      const insertedRecipes = await Promise.all(
        placeholderRecipes.map(async (recipe) => {
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
              author.location, // Use author's location as recipe location
            ]
          );
        }),
      );
  
      console.log(`Seeded ${insertedRecipes.filter(Boolean).length} recipes`);
    } catch (error) {
      console.error('Error seeding recipes:', error);
      throw error;
    }
}

async function seedOtps(client: Pool) {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "OTP" (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        code VARCHAR(6) NOT NULL,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log(`Created "OTP" table`);
  } catch (error) {
    console.error('Error seeding OTPs:', error);
    throw error;
  }
}


async function main() {
  const client = await pool.connect();

  try {
    // Note: Order of execution matters due to foreign key constraints
    await client.query('DROP TABLE IF EXISTS "Recipe" CASCADE;');
    await client.query('DROP TABLE IF EXISTS "OTP" CASCADE;');
    await client.query('DROP TABLE IF EXISTS "User" CASCADE;');
    console.log('Finished dropping tables.');

    await seedUsers(pool);
    await seedRecipes(pool);
    await seedOtps(pool);

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
