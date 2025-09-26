import type { Config } from "drizzle-kit";
import { config as loadEnv } from "dotenv";
import { resolve } from "path";

// Load env from local .env
loadEnv({ path: resolve(__dirname, ".env") });

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgres://postgres:mysecretpassword@localhost:5432/postgres",
  },
} satisfies Config;
