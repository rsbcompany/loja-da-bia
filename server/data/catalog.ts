import { and, eq } from "drizzle-orm";
import type { Db } from "./db";
import { catalog } from "./schema";
import type { CatalogItem } from "@/lib/bia/types";

export async function listCatalogByUser(db: Db, userId: string) {
  return db.select().from(catalog).where(eq(catalog.userId, userId));
}

export async function findCatalogItem(db: Db, userId: string, nome: string) {
  const rows = await db
    .select()
    .from(catalog)
    .where(and(eq(catalog.userId, userId), eq(catalog.nome, nome)));
  return rows[0];
}

export async function insertCatalogItem(db: Db, userId: string, item: CatalogItem) {
  const rows = await db
    .insert(catalog)
    .values({ ...item, userId })
    .returning();
  return rows[0];
}

export async function deleteCatalogByUser(db: Db, userId: string) {
  await db.delete(catalog).where(eq(catalog.userId, userId));
}
