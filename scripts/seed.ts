require('dotenv').config({ path: '.env' });

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

async function setupTables(client: Pool) {
  try {
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    // Create User table
    const userTableCreateQuery = `
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
    `;
    await client.query(userTableCreateQuery);
    console.log(`Ensured "User" table exists.`);

    // Create Recipe table
    const recipeTableCreateQuery = `
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
        "authorId" UUID NOT NULL,
        "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        location VARCHAR(255),
        contact VARCHAR(255)
      );
    `;
    await client.query(recipeTableCreateQuery);
    console.log(`Ensured "Recipe" table exists.`);

    // Create OTP table
    const otpTableCreateQuery = `
      CREATE TABLE IF NOT EXISTS "OTP" (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          code VARCHAR(6) NOT NULL,
          "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
          expires TIMESTAMPTZ NOT NULL,
          "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await client.query(otpTableCreateQuery);
    console.log(`Ensured "OTP" table exists.`);

  } catch (error) {
    console.error('Error setting up tables:', error);
    throw error;
  }
}

async function main() {
  const client = await pool.connect();

  try {
    await setupTables(pool);
    console.log("Database table setup completed successfully.");

  } catch (error) {
    console.error(
      'An error occurred while attempting to set up the database tables:',
      error,
    );
  } finally {
    await client.release();
    await pool.end();
  }
}

main();
