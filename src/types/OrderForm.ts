import type { Entrega, Status } from "@/lib/bia/types";

export type OrderForm = {
  cliente: string;
  produto: string;
  qtd: number;
  valor: string;
  status: Status;
  data: string;
  pgto: string;
  obs: string;
  detalhe: string;
  entrega: Entrega;
  rastreio: string;
};
