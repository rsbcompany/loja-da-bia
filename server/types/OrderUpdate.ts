import type { Order } from "@/lib/bia/types";

export type OrderUpdate = {
  userId: string;
  id: string;
  patch: Partial<Order>;
};
