import type { Db } from "../data/db";
import type { AppData, HistoryEntry, Order } from "@/lib/bia/types";
import { clientKey, todayISO } from "@/lib/bia/format";
import { findOrderById, insertOrder, updateOrderRow } from "../data/orders";
import { orders as ordersTable } from "../data/schema";
import { ensureCatalogItem } from "./catalog";
import { ensureClient } from "./clients";
import { loadAppData } from "./snapshot";
import { AppError } from "../types/AppError";
import type { NewOrder } from "../types/NewOrder";
import type { OrderUpdate } from "../types/OrderUpdate";

const HISTORY_FIELDS = [
  "cliente",
  "produto",
  "qtd",
  "valor",
  "status",
  "data",
  "pgto",
  "obs",
  "detalhe",
  "entrega",
] as const;
const FLAG_FIELDS = ["arquivado", "excluido"] as const;

export async function createOrder(db: Db, userId: string, input: NewOrder): Promise<AppData> {
  if (!input.cliente.trim()) throw new AppError(400, "Informe o nome do cliente");
  const nome = (await ensureClient(db, userId, input.cliente)).nome;
  await insertOrder(db, userId, buildNewOrder(input, nome));
  await ensureCatalogItem(db, userId, input);
  return loadAppData(db, userId);
}

export async function updateOrder(db: Db, input: OrderUpdate): Promise<AppData> {
  const found = await findOrderById(db, input.userId, input.id);
  if (!found) throw new AppError(404, "Pedido não encontrado");
  const patch = await resolveClientePatch(db, input.userId, found, input.patch);
  await updateOrderRow(db, withHistory(found, patch, new Date()));
  return loadAppData(db, input.userId);
}

export async function setOrderFlags(db: Db, input: OrderUpdate): Promise<AppData> {
  const found = await findOrderById(db, input.userId, input.id);
  if (!found) throw new AppError(404, "Pedido não encontrado");
  await updateOrderRow(db, {
    ...found,
    ...input.patch,
    criadoEm: found.criadoEm ?? null,
    updatedAt: new Date(),
  });
  return loadAppData(db, input.userId);
}

export function diffHistory(
  row: typeof ordersTable.$inferSelect,
  patch: Partial<Order>,
  ts: string,
): HistoryEntry[] {
  return [...HISTORY_FIELDS, ...FLAG_FIELDS].flatMap(
    (campo) => buildHistoryEntry(row, patch, campo, ts) ?? [],
  );
}

function buildHistoryEntry(
  row: typeof ordersTable.$inferSelect,
  patch: Partial<Order>,
  campo: (typeof HISTORY_FIELDS)[number] | (typeof FLAG_FIELDS)[number],
  ts: string,
) {
  if (!(campo in patch)) return undefined;
  const before = String(row[campo]);
  const after = String(patch[campo]);
  return before === after ? undefined : { ts, campo, de: before, para: after };
}

function withHistory(
  row: typeof ordersTable.$inferSelect,
  patch: Partial<Order>,
  now: Date,
): typeof ordersTable.$inferInsert & { id: string } {
  const historico = [...row.historico, ...diffHistory(row, patch, now.toISOString())];
  return { ...row, ...patch, criadoEm: row.criadoEm ?? null, historico, updatedAt: now };
}

function buildNewOrder(
  input: NewOrder,
  nome: string,
): Omit<typeof ordersTable.$inferInsert, "userId"> {
  return {
    ...input,
    id: `o-${crypto.randomUUID()}`,
    cliente: nome,
    clienteKey: clientKey(nome) || "(sem nome)",
    data: input.data || todayISO(),
    criadoEm: new Date(),
  };
}

async function resolveClientePatch(
  db: Db,
  userId: string,
  found: typeof ordersTable.$inferSelect,
  patch: Partial<Order>,
): Promise<Partial<Order>> {
  const changed = patch.cliente && patch.cliente !== found.cliente;
  if (!changed) return patch;
  const client = await ensureClient(db, userId, patch.cliente ?? "");
  return { ...patch, cliente: client.nome, clienteKey: client.key };
}
