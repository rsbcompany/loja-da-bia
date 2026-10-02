import type { Client } from "@/lib/bia/types";

export type ClientReplace = {
  userId: string;
  oldKey: string;
  nextKey: string;
  merged: Client;
};
