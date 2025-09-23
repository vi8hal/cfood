require('dotenv').config({ path: '.env.local' });

import { Pool } from 'pg';
import { users as placeholderUsers, recipes as placeholderRecipes } from '../src/lib/placeholder-data';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

async function seedUsers(client: Pool) {
  try {
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
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
    
    // Check if users table is empty before seeding
    const userCount = await client.query('SELECT COUNT(*) FROM "User"');
    if (parseInt(userCount.rows[0].count, 10) > 0) {
        console.log('Users table is not empty. Skipping seeding users.');
        return;
    }

    const insertedUsers = await Promise.all(
      placeholderUsers.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return client.query(
          `
          INSERT INTO "User" (id, name, email, password, image, location, "emailVerified")
          VALUES ($1, $2, $3, $4, $5, $6, NOW())
          ON CONFLICT (email) DO NOTHING;
        `,
          [user.id, user.name, user.email, hashedPassword, user.image, user.location]
        );
      }),
    );

    console.log(`Seeded ${insertedUsers.length} users`);
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

async function seedRecipes(client: Pool) {
    try {
      await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  
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
  
      const recipeCount = await client.query('SELECT COUNT(*) FROM "Recipe"');
      if (parseInt(recipeCount.rows[0].count, 10) > 0) {
          console.log('Recipes table is not empty. Skipping seeding recipes.');
          return;
      }

      const usersResult = await client.query('SELECT * from "User"');
      const dbUsers = usersResult.rows;

      if (dbUsers.length === 0) {
        console.warn("No users found in DB. Cannot seed recipes.");
        return;
      }
  
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
              author.location,
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
                code VARCHAR(6) NOT NULL,
                "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
                expires TIMESTAMPTZ NOT NULL,
                "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log(`Created "OTP" table`);
    } catch (error) {
        console.error('Error creating OTP table:', error);
        throw error;
    }
}

async function main() {
  const client = await pool.connect();

  try {
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
