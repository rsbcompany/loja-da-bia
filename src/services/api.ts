import { createServerFn } from "@tanstack/react-start";
import {
  deleteCookie,
  getCookie,
  getRequestProtocol,
  setCookie,
} from "@tanstack/react-start/server";
import { getDb, type Db } from "../../server/data/db";
import { deleteSessionByHash, findSessionUser } from "../../server/data/sessions";
import { hashSessionToken } from "../../server/services/auth";
import { startSession } from "../../server/services/session";
import { createOrder, setOrderFlags, updateOrder } from "../../server/services/orders";
import { saveClient } from "../../server/services/clients";
import { dismissDuplicate, importAppData, markBackedUp } from "../../server/services/data";
import { loadAppData } from "../../server/services/snapshot";
import { AppError } from "../../server/types/AppError";
import type { HandlerResult } from "../../server/types/HandlerResult";
import type { WithUser } from "../../server/types/WithUser";
import type { SessionUser } from "../../server/types/SessionUser";
import type { NewOrder } from "../../server/types/NewOrder";
import type { OrderPatch } from "../../server/types/OrderPatch";
import type { ClientMerge } from "../../server/types/ClientMerge";
import type { AppData } from "@/lib/bia/types";
import { ApiError } from "./ApiError";

const SESSION_COOKIE = "ldb_session";
const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

type Credentials = { email: string; password: string };
type DismissKey = { key: string };

export const fetchAppData = createServerFn({ method: "GET" }).handler(() =>
  toResult<AppData>(async () => runWithUser(({ db, userId }) => loadAppData(db, userId))),
);

export const importAppDataFn = createServerFn({ method: "POST" })
  .validator((input: AppData) => input)
  .handler(({ data }) =>
    toResult<AppData>(async () => runWithUser(({ db, userId }) => importAppData(db, userId, data))),
  );

export const createOrderFn = createServerFn({ method: "POST" })
  .validator((input: NewOrder) => input)
  .handler(({ data }) =>
    toResult<AppData>(async () => runWithUser(({ db, userId }) => createOrder(db, userId, data))),
  );

export const updateOrderFn = createServerFn({ method: "POST" })
  .validator((input: OrderPatch) => input)
  .handler(({ data }) =>
    toResult<AppData>(async () =>
      runWithUser(({ db, userId }) => updateOrder(db, { userId, id: data.id, patch: data.patch })),
    ),
  );

export const setOrderFlagsFn = createServerFn({ method: "POST" })
  .validator((input: OrderPatch) => input)
  .handler(({ data }) =>
    toResult<AppData>(async () =>
      runWithUser(({ db, userId }) =>
        setOrderFlags(db, { userId, id: data.id, patch: data.patch }),
      ),
    ),
  );

export const saveClientFn = createServerFn({ method: "POST" })
  .validator((input: ClientMerge) => input)
  .handler(({ data }) =>
    toResult<AppData>(async () =>
      runWithUser(({ db, userId }) =>
        saveClient(db, { userId, oldKey: data.oldKey, client: data.client }),
      ),
    ),
  );

export const dismissDuplicateFn = createServerFn({ method: "POST" })
  .validator((input: DismissKey) => input)
  .handler(({ data }) =>
    toResult<AppData>(async () =>
      runWithUser(({ db, userId }) => dismissDuplicate(db, userId, data.key)),
    ),
  );

export const markBackupFn = createServerFn({ method: "POST" }).handler(() =>
  toResult<AppData>(async () => runWithUser(({ db, userId }) => markBackedUp(db, userId))),
);

export const loginFn = createServerFn({ method: "POST" })
  .validator((input: Credentials) => input)
  .handler(({ data }) =>
    toResult<SessionUser>(async () => {
      const session = await startSession(getDb(), data.email, data.password);
      setSessionCookie(session.token);
      return session.user;
    }),
  );

export const logoutFn = createServerFn({ method: "POST" }).handler(() =>
  toResult<boolean>(async () => {
    await destroyCurrentSession();
    return true;
  }),
);

export async function fetchAppDataSnapshot(): Promise<AppData> {
  return unwrap(fetchAppData());
}

export async function importBackup(data: AppData): Promise<AppData> {
  return unwrap(importAppDataFn({ data }));
}

export async function createNewOrder(input: NewOrder): Promise<AppData> {
  return unwrap(createOrderFn({ data: input }));
}

export async function patchOrder(input: OrderPatch): Promise<AppData> {
  return unwrap(updateOrderFn({ data: input }));
}

export async function patchOrderFlags(input: OrderPatch): Promise<AppData> {
  return unwrap(setOrderFlagsFn({ data: input }));
}

export async function mergeClient(input: ClientMerge): Promise<AppData> {
  return unwrap(saveClientFn({ data: input }));
}

export async function dismissDuplicateKey(key: string): Promise<AppData> {
  return unwrap(dismissDuplicateFn({ data: { key } }));
}

export async function markBackedUpNow(): Promise<AppData> {
  return unwrap(markBackupFn());
}

export async function login(email: string, password: string): Promise<HandlerResult<SessionUser>> {
  return loginFn({ data: { email, password } });
}

export async function logout(): Promise<void> {
  await unwrap(logoutFn());
}

async function runWithUser<T>(action: (scope: WithUser) => Promise<T>): Promise<T> {
  return action(await readWithUser());
}

async function readWithUser(): Promise<WithUser> {
  const db = getDb();
  const user = await readSessionUser(db);
  if (!user) throw new AppError(401, "Sessão expirada — entre novamente");
  return { db, userId: user.id };
}

async function readSessionUser(db: Db): Promise<SessionUser | undefined> {
  const token = getCookie(SESSION_COOKIE);
  if (!token) return undefined;
  return findSessionUser(db, await hashSessionToken(token));
}

async function destroyCurrentSession(): Promise<void> {
  const db = getDb();
  const token = getCookie(SESSION_COOKIE);
  if (!token) return;
  await deleteSessionByHash(db, await hashSessionToken(token));
  clearSessionCookie();
}

function setSessionCookie(token: string) {
  setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
    secure: isSecureRequest(),
  });
}

function clearSessionCookie() {
  deleteCookie(SESSION_COOKIE, { path: "/" });
}

function isSecureRequest(): boolean {
  return getRequestProtocol() === "https";
}

async function unwrap<T>(promise: Promise<HandlerResult<T>>): Promise<T> {
  const result = await promise;
  if (!result.ok) throw new ApiError(result.status, result.message);
  return result.data;
}

async function toResult<T>(action: () => Promise<T>): Promise<HandlerResult<T>> {
  try {
    return { ok: true, data: await action() };
  } catch (error) {
    return buildErrorResult(error);
  }
}

function buildErrorResult(error: unknown) {
  const status = error instanceof AppError ? error.status : 500;
  const message = error instanceof Error ? error.message : "Erro inesperado";
  return { ok: false as const, status, message };
}
