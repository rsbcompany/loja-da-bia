import type { Client } from "@/lib/bia/types";

export type ClientSave = {
  userId: string;
  oldKey: string;
  client: Client;
};
