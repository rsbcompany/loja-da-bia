import { and, eq, gt } from "drizzle-orm";
import type { Db } from "./db";
import { sessions, users } from "./schema";
import type { NewSession } from "../types/NewSession";
import type { SessionUser } from "../types/SessionUser";

export async function insertSession(db: Db, session: NewSession) {
  await db.insert(sessions).values(session);
}

export async function findSessionUser(db: Db, tokenHash: string): Promise<SessionUser | undefined> {
  const rows = await db
    .select({ id: users.id, email: users.email })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())));
  return rows[0];
}

export async function deleteSessionByHash(db: Db, tokenHash: string) {
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}
