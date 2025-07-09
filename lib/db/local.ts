import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Use regular PostgreSQL driver for local development
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5478/whixgame',
});

export const db = drizzle(pool, { 
  schema 
});

export * from './schema';