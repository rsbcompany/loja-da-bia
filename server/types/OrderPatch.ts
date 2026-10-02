import type { Order } from "@/lib/bia/types";

export type OrderPatch = {
  id: string;
  patch: Partial<Order>;
};
