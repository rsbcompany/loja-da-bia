import type { Order } from "./types";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const fmtBRL = (v: number) => brl.format(v || 0);
export const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}/${m}/${y}` : iso;
};
export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
export const fmtMonth = (ym: string) => {
  const [y, m] = ym.split("-");
  return `${MESES[Number(m) - 1]}/${y}`;
};

export function clientKey(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function waLink(phone: string) {
  let d = phone.replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("0")) d = d.replace(/^0+/, "");
  if (d.length === 10 || d.length === 11) d = "55" + d;
  return `https://wa.me/${d}`;
}
export function igLink(handle: string) {
  const h = handle.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "");
  return h ? `https://www.instagram.com/${encodeURIComponent(h)}` : "";
}

export const isActive = (o: Order) => !o.arquivado && !o.excluido;
export const openFlags = (o: Order) => o.flags.filter((f) => !(o.flagsResolvidas ?? []).includes(f));

export function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

const cell = (s: string | number) => String(s ?? "").replace(/[;\r\n]+/g, " ").trim();
export function toCSV(orders: Order[]) {
  const head = ["Nome do cliente", "produto", "Qtd", "VALOR", "Status do Pedido", "Data", "Forma pgto", "Observações", "Detalhe", "Entrega"];
  const rows = orders.map((o) =>
    [o.cliente, o.produto, o.qtd, o.valor.toFixed(2).replace(".", ","), o.status, fmtDate(o.data), o.pgto, o.obs, o.detalhe, o.entrega].map(cell).join(";"),
  );
  return "\uFEFF" + [head.join(";"), ...rows].join("\n");
}
