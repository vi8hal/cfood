import { Pool } from 'pg';

// This file is now vestigial and will be replaced by Prisma.
// The Prisma client should be used for all database interactions.
// You can initialize Prisma in a file like 'src/lib/prisma.ts'

let pool: Pool;

// In a serverless environment, database connections should be managed carefully.
// We are creating a single pool instance and reusing it across function invocations.
// This is more efficient than creating a new connection for every request.
if (!pool!) {
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    // We can add SSL configuration here if needed,
    // but Neon's serverless driver handles this automatically.
  });
}

export { pool };
