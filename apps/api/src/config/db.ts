import { Pool } from "pg";

import { env } from "./env";

export const db = new Pool({
  connectionString: env.DATABASE_URL,
});

db.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error.message);
});

export async function testDatabaseConnection(): Promise<void> {
  try {
    await db.query("SELECT 1");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";

    throw new Error(
      `Unable to connect to PostgreSQL. Check DATABASE_URL and that the database is running. Details: ${message}`,
    );
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  await db.end();
}
