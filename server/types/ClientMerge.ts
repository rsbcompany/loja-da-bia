import type { Client } from "@/lib/bia/types";

export type ClientMerge = {
  oldKey: string;
  client: Client;
};
