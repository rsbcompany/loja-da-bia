export type HandlerResult<T> =
  { ok: true; data: T } | { ok: false; status: number; message: string };
