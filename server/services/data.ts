import type { Db } from "../data/db";
import type { AppData, Meta } from "@/lib/bia/types";
import { deleteCatalogByUser } from "../data/catalog";
import { deleteClientsByUser, insertClient } from "../data/clients";
import { deleteOrdersByUser, insertOrdersBulk } from "../data/orders";
import { orders as ordersTable } from "../data/schema";
import { ensureMetaRow, updateMetaByUser } from "../data/meta";
import { loadAppData } from "./snapshot";
import { AppError } from "../types/AppError";

export async function importAppData(db: Db, userId: string, incoming: AppData): Promise<AppData> {
  assertValidSnapshot(incoming);
  await Promise.all([
    deleteOrdersByUser(db, userId),
    deleteClientsByUser(db, userId),
    deleteCatalogByUser(db, userId),
  ]);
  await insertClients(db, userId, incoming.clients);
  await insertOrdersBulk(db, userId, incoming.orders.map(buildOrderValues));
  await applyImportedMeta(db, { userId, meta: incoming.meta, total: incoming.orders.length });
  return loadAppData(db, userId);
}

export async function markBackedUp(db: Db, userId: string): Promise<AppData> {
  await ensureMetaRow(db, userId);
  await updateMetaByUser(db, userId, { changesSinceBackup: 0, lastBackupAt: new Date() });
  return loadAppData(db, userId);
}

export async function dismissDuplicate(db: Db, userId: string, key: string): Promise<AppData> {
  const meta = await ensureMetaRow(db, userId);
  const dupDismissed = Array.from(new Set([...meta.dupDismissed, key]));
  await updateMetaByUser(db, userId, { dupDismissed });
  return loadAppData(db, userId);
}

export function assertValidSnapshot(incoming: AppData): void {
  const valid =
    Array.isArray(incoming.orders) &&
    Array.isArray(incoming.clients) &&
    Array.isArray(incoming.catalog);
  if (!valid) throw new AppError(400, "Backup inválido — estrutura não reconhecida");
}

function buildOrderValues(
  incoming: AppData["orders"][number],
): Omit<typeof ordersTable.$inferInsert, "userId"> {
  return { ...incoming, criadoEm: incoming.criadoEm ? new Date(incoming.criadoEm) : null };
}

async function insertClients(db: Db, userId: string, clients: AppData["clients"]) {
  await Promise.all(clients.map((client) => insertClient(db, userId, client)));
}

async function applyImportedMeta(db: Db, input: { userId: string; meta: Meta; total: number }) {
  await ensureMetaRow(db, input.userId);
  await updateMetaByUser(db, input.userId, {
    importedAt: new Date(),
    lastBackupAt: new Date(input.meta.lastBackupAt),
    changesSinceBackup: input.meta.changesSinceBackup,
    importTotal: input.total,
    dupDismissed: input.meta.dupDismissed ?? [],
  });
}
