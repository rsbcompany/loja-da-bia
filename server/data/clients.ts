import { and, eq } from "drizzle-orm";
import type { Db } from "./db";
import { clients } from "./schema";
import type { Client } from "@/lib/bia/types";

export async function listClientsByUser(db: Db, userId: string) {
  return db.select().from(clients).where(eq(clients.userId, userId));
}

export async function findClientByKey(db: Db, userId: string, key: string) {
  const rows = await db
    .select()
    .from(clients)
    .where(and(eq(clients.userId, userId), eq(clients.key, key)));
  return rows[0];
}

export async function insertClient(db: Db, userId: string, client: Client) {
  const rows = await db
    .insert(clients)
    .values({ ...client, userId })
    .returning();
  return rows[0]!;
}

export async function deleteClientByKey(db: Db, userId: string, key: string) {
  await db.delete(clients).where(and(eq(clients.userId, userId), eq(clients.key, key)));
}

export async function updateClientVariantes(
  db: Db,
  userId: string,
  patch: { key: string; variantes: string[] },
) {
  await db
    .update(clients)
    .set({ variantes: patch.variantes })
    .where(and(eq(clients.userId, userId), eq(clients.key, patch.key)));
}

export async function deleteClientsByUser(db: Db, userId: string) {
  await db.delete(clients).where(eq(clients.userId, userId));
}
