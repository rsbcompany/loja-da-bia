export type Status = "pendente" | "pago" | "enviado" | "cancelado" | "devolvido";
export type Entrega = "" | "Retirada" | "Correios" | "Entrega em mãos";

export const STATUSES: { id: Status; label: string }[] = [
  { id: "pendente", label: "Aguardando pagamento" },
  { id: "pago", label: "Pago" },
  { id: "enviado", label: "Enviado" },
  { id: "cancelado", label: "Cancelado" },
  { id: "devolvido", label: "Devolvido" },
];
export const PGTOS = ["Pix", "Cartão", "Dinheiro", "Transferência"];
export const ENTREGAS: Entrega[] = ["Retirada", "Correios", "Entrega em mãos"];

export interface HistoryEntry {
  ts: string;
  campo: string;
  de: string;
  para: string;
}

export interface Order {
  id: string;
  clienteKey: string;
  cliente: string;
  produto: string;
  qtd: number;
  valor: number;
  status: Status;
  data: string;
  pgto: string;
  obs: string;
  detalhe: string;
  entrega: Entrega;
  valorOriginal?: string;
  statusOriginal?: string;
  dataOriginal?: string;
  pgtoOriginal?: string;
  clienteOriginal?: string;
  linhaOrigem?: number;
  flags: string[];
  flagsResolvidas?: string[];
  arquivado: boolean;
  motivoArquivo: string;
  excluido: boolean;
  historico: HistoryEntry[];
  criadoEm?: string;
}

export interface Client {
  key: string;
  nome: string;
  variantes: string[];
  whatsapp: string;
  instagram: string;
  enderecos: string[];
  notas: string;
}

export interface CatalogItem {
  nome: string;
  preco: number;
}

export interface Meta {
  importedAt: string;
  changesSinceBackup: number;
  lastBackupAt: string;
  importTotal: number;
  dupDismissed?: string[];
}

export interface AppData {
  version: number;
  orders: Order[];
  clients: Client[];
  catalog: CatalogItem[];
  meta: Meta;
}
