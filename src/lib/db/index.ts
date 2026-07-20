import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não está definido (confira o arquivo .env).");
}

const client = postgres(process.env.DATABASE_URL, { max: 10 });

export const db = drizzle(client, { schema });
export { schema };
