import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Neon PostgreSQL Serverless Client & Drizzle ORM
 * 
 * Provides a provider-independent SQL query helper connected to Neon.
 */

// Enable fetch caching control if needed
neonConfig.fetchConnectionCache = true;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is missing. Please configure DATABASE_URL in your environment or .env.local.");
}

export const sql = neon(connectionString);
export const db = drizzle(sql, { schema });

