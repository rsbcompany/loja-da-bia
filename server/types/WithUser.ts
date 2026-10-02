import type { Db } from "../data/db";

export type WithUser = {
  db: Db;
  userId: string;
};
