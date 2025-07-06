import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import * as gachaSchema from './schema/gacha';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { 
  schema: {
    ...schema,
    ...gachaSchema,
  }
});

export * from './schema';
export * from './schema/gacha';