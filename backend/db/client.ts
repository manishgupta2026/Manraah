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

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_BHXyxj9gdEV8@ep-aged-glade-axiish12-pooler.c-4.us-east-2.aws.neon.tech/manraah?sslmode=require&channel_binding=require";

export const sql = neon(connectionString);
export const db = drizzle(sql, { schema });

