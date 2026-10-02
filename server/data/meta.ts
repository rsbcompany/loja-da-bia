import { eq } from "drizzle-orm";
import type { Db } from "./db";
import { appMeta } from "./schema";

export async function findMetaByUser(db: Db, userId: string) {
  const rows = await db.select().from(appMeta).where(eq(appMeta.userId, userId));
  return rows[0];
}

export async function insertMeta(db: Db, values: typeof appMeta.$inferInsert) {
  const rows = await db.insert(appMeta).values(values).returning();
  return rows[0]!;
}

export async function updateMetaByUser(
  db: Db,
  userId: string,
  patch: Partial<typeof appMeta.$inferInsert>,
) {
  const rows = await db.update(appMeta).set(patch).where(eq(appMeta.userId, userId)).returning();
  return rows[0]!;
}

export async function ensureMetaRow(db: Db, userId: string) {
  const existing = await findMetaByUser(db, userId);
  if (existing) return existing;
  return insertMeta(db, { userId });
}
