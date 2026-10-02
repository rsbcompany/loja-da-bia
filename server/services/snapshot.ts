import type { Db } from "../data/db";
import type { AppData, CatalogItem, Client, Meta, Order } from "@/lib/bia/types";
import { ensureMetaRow } from "../data/meta";
import { listCatalogByUser } from "../data/catalog";
import { listClientsByUser } from "../data/clients";
import { listOrdersByUser } from "../data/orders";
import {
  catalog as catalogTable,
  clients as clientsTable,
  orders as ordersTable,
  appMeta,
} from "../data/schema";

export async function loadAppData(db: Db, userId: string): Promise<AppData> {
  const meta = await ensureMetaRow(db, userId);
  const rows = await Promise.all([
    listOrdersByUser(db, userId),
    listClientsByUser(db, userId),
    listCatalogByUser(db, userId),
  ]);
  return {
    version: 1,
    orders: rows[0].map(mapOrderRow),
    clients: rows[1].map(mapClientRow),
    catalog: rows[2].map(mapCatalogRow),
    meta: mapMetaRow(meta),
  };
}

export function mapOrderRow(row: typeof ordersTable.$inferSelect): Order {
  const { userId: _scoped, updatedAt: _updated, criadoEm, ...order } = omitNullValues(row);
  if (!criadoEm) return order;
  return { ...order, criadoEm: criadoEm.toISOString() };
}

type NullStripped<T> = { [K in keyof T]: null extends T[K] ? Exclude<T[K], null> : T[K] };

function omitNullValues<T extends object>(source: T): NullStripped<T> {
  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => value !== null),
  ) as NullStripped<T>;
}

export function mapClientRow(row: typeof clientsTable.$inferSelect): Client {
  const { userId: _scoped, id: _rowId, ...client } = row;
  return client;
}

export function mapCatalogRow(row: typeof catalogTable.$inferSelect): CatalogItem {
  return { nome: row.nome, preco: row.preco };
}

export function mapMetaRow(row: typeof appMeta.$inferSelect): Meta {
  return {
    importedAt: row.importedAt.toISOString(),
    lastBackupAt: row.lastBackupAt.toISOString(),
    changesSinceBackup: row.changesSinceBackup,
    importTotal: row.importTotal,
    dupDismissed: row.dupDismissed,
  };
}
