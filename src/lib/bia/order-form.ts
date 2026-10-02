import { todayISO } from "@/lib/bia/format";
import type { Order } from "@/lib/bia/types";
import type { OrderForm } from "@/types/OrderForm";

export function parseVal(input: string) {
  let clean = input.replace(/R\$|\s/g, "");
  if (clean.includes(",")) clean = clean.replace(/\./g, "").replace(",", ".");
  const number = parseFloat(clean);
  return isNaN(number) ? 0 : Math.round(number * 100) / 100;
}

export function buildForm(order?: Order): OrderForm {
  const empty: OrderForm = {
    cliente: "",
    produto: "",
    qtd: 1,
    valor: "",
    status: "pendente",
    data: todayISO(),
    pgto: "",
    obs: "",
    detalhe: "",
    entrega: "",
    rastreio: "",
  };
  if (!order) return empty;
  return {
    ...empty,
    cliente: order.cliente,
    produto: order.produto,
    qtd: order.qtd,
    valor: order.valor.toFixed(2).replace(".", ","),
    status: order.status,
    data: order.data,
    pgto: order.pgto,
    obs: order.obs,
    detalhe: order.detalhe,
    entrega: order.entrega,
    rastreio: order.rastreio ?? "",
  };
}

export function nextQtdForm(form: OrderForm, nextQtd: number, unitPrice?: number): OrderForm {
  const qtd = Math.max(1, nextQtd);
  const unit = unitPrice ?? (form.qtd ? parseVal(form.valor) / form.qtd : 0);
  return { ...form, qtd, valor: unit ? (unit * qtd).toFixed(2).replace(".", ",") : form.valor };
}

export function hasFilledExtras(order?: Order): boolean {
  return Boolean(order && (order.detalhe || order.entrega || order.obs));
}

export function isValidForm(form: OrderForm): boolean {
  return Boolean(form.cliente.trim() && form.produto.trim());
}
