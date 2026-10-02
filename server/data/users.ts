import { eq, sql } from "drizzle-orm";
import type { Db } from "./db";
import { users } from "./schema";

export async function countUsers(db: Db): Promise<number> {
  const rows = await db.select({ total: sql<number>`count(*)::int` }).from(users);
  return rows[0]?.total ?? 0;
}

export async function findUserByEmail(db: Db, email: string) {
  const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
  return rows[0];
}

export async function insertUser(db: Db, email: string, passwordHash: string) {
  const rows = await db
    .insert(users)
    .values({ email: email.toLowerCase(), passwordHash })
    .returning();
  return rows[0]!;
}
