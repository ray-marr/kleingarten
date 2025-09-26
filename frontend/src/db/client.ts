import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { config as loadEnv } from "dotenv";
import { resolve } from "path";

// Load .env when running outside the Next.js runtime
loadEnv({ path: resolve(process.cwd(), "frontend/.env") });

const connectionString = process.env.DATABASE_URL || "postgres://postgres:mysecretpassword@localhost:5432/postgres";

export const pool = new Pool({ connectionString });
export const db = drizzle(pool);
