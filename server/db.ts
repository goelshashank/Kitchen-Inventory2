import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Check if we have a DATABASE_URL environment variable

if (!process.env.DATABASE_URL) {
  console.error("Missing DATABASE_URL environment variable");
  process.exit(1);
}

// Create a Postgres connection
const connectionString = process.env.DATABASE_URL;
console.log("Connecting to database...");

// Create a Postgres client
const client = postgres(connectionString);

// Create a Drizzle instance with our schema
export const db = drizzle(client, { schema });