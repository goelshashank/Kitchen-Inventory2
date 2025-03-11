import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// Create a connection to Neon Postgres
const sql = neon(process.env.DATABASE_URL!);

// Create a Drizzle instance with our schema
export const db = drizzle(sql, { schema });