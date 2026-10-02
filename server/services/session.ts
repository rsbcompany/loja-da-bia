import type { Db } from "../data/db";
import { findUserByEmail } from "../data/users";
import { insertSession } from "../data/sessions";
import { buildSessionToken, hashSessionToken, verifyPassword } from "./auth";
import { AppError } from "../types/AppError";
import type { SessionUser } from "../types/SessionUser";

const SESSION_TTL_DAYS = 30;

export async function startSession(
  db: Db,
  email: string,
  password: string,
): Promise<{ token: string; user: SessionUser }> {
  const user = await findUserByEmail(db, email);
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !valid) throw new AppError(401, "E-mail ou senha inválidos");
  const token = buildSessionToken();
  await insertSession(db, {
    tokenHash: await hashSessionToken(token),
    userId: user.id,
    expiresAt: buildExpiry(SESSION_TTL_DAYS),
  });
  return { token, user: { id: user.id, email: user.email } };
}

function buildExpiry(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
