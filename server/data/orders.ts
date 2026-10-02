import { and, eq, or } from "drizzle-orm";
import type { Db } from "./db";
import { orders } from "./schema";
import type { OrderReassign } from "../types/OrderReassign";

export async function listOrdersByUser(db: Db, userId: string) {
  return db.select().from(orders).where(eq(orders.userId, userId));
}

export async function findOrderById(db: Db, userId: string, id: string) {
  const rows = await db
    .select()
    .from(orders)
    .where(and(eq(orders.userId, userId), eq(orders.id, id)));
  return rows[0];
}

export async function insertOrder(
  db: Db,
  userId: string,
  values: Omit<typeof orders.$inferInsert, "userId">,
) {
  const rows = await db
    .insert(orders)
    .values({ ...values, userId })
    .returning();
  return rows[0]!;
}

export async function insertOrdersBulk(
  db: Db,
  userId: string,
  values: Omit<typeof orders.$inferInsert, "userId">[],
) {
  if (!values.length) return;
  await db.insert(orders).values(values.map((row) => ({ ...row, userId })));
}

export async function updateOrderRow(db: Db, next: typeof orders.$inferInsert & { id: string }) {
  const { id, userId, ...fields } = next;
  const rows = await db
    .update(orders)
    .set(fields)
    .where(and(eq(orders.id, id), eq(orders.userId, userId)))
    .returning();
  return rows[0]!;
}

export async function reassignOrdersCliente(db: Db, input: OrderReassign) {
  await db
    .update(orders)
    .set({ clienteKey: input.toKey, cliente: input.cliente })
    .where(
      and(
        eq(orders.userId, input.userId),
        or(eq(orders.clienteKey, input.fromKey), eq(orders.clienteKey, input.toKey)),
      ),
    );
}

export async function deleteOrdersByUser(db: Db, userId: string) {
  await db.delete(orders).where(eq(orders.userId, userId));
}
