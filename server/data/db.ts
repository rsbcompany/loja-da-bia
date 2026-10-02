import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

export type Db = NeonHttpDatabase<typeof schema>;

let cachedDb: Db | undefined;

export function buildDb(url: string): Db {
  return drizzle(neon(url), { schema });
}

function readDatabaseUrl(): string {
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("DATABASE_URL is not configured");
  return url;
}

export function getDb(): Db {
  cachedDb ??= buildDb(readDatabaseUrl());
  return cachedDb;
}
