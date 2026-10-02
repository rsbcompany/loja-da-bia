import type { Order } from "@/lib/bia/types";

export type NewOrder = Omit<
  Order,
  "id" | "clienteKey" | "flags" | "arquivado" | "motivoArquivo" | "excluido" | "historico"
>;
