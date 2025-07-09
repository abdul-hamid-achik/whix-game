import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Use Docker DATABASE_URL if available (when running inside Docker)
// Otherwise use regular DATABASE_URL (for local development)
const databaseUrl = process.env.DATABASE_URL_DOCKER || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL or DATABASE_URL_DOCKER must be set');
}

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
} satisfies Config;