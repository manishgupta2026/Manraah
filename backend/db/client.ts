import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Neon PostgreSQL Serverless Client & Drizzle ORM
 * 
 * Provides a provider-independent SQL query helper connected to Neon.
 */

// Resilient fetch wrapper with automatic retry for serverless database connection
const resilientFetch = async (url: any, options: any) => {
  let attempts = 0;
  const maxAttempts = 3;
  while (attempts < maxAttempts) {
    try {
      attempts++;
      return await fetch(url, options);
    } catch (err: any) {
      if (attempts >= maxAttempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, 150 * attempts));
    }
  }
};

neonConfig.fetchFunction = resilientFetch;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is missing. Please configure DATABASE_URL in your environment or .env.local.");
}

export const sql = neon(connectionString);
export const db = drizzle(sql, { schema });

