import { Archive, Bell, ShieldCheck, WifiOff } from "lucide-react";
import { todayISO } from "@/lib/bia/format";
import type { LpFuture } from "@/types/LpFuture";
import type { LpStatus } from "@/types/LpStatus";
import type { LpStep } from "@/types/LpStep";
import type { LpTrustNote } from "@/types/LpTrustNote";

export const DEMO_MESSAGE = "Oi, Bia! Vou querer 2 cangas, pode ser Pix?";

export const DEMO_ORDER = {
  cliente: "Maria",
  produto: "canga",
  qtd: 2,
  valor: 90,
  pgto: "Pix",
  rastreio: "BR482910573BR",
  data: todayISO(),
};

export const CHIP_LABELS: Record<LpStatus, string> = {
  pendente: "Pendente",
  pago: "Pago",
  enviado: "Enviado",
  entregue: "Entregue",
};

export const CHIP_STYLE: Record<LpStatus, string> = {
  pendente: "bg-warning text-warning-foreground",
  pago: "bg-accent text-accent-foreground",
  enviado: "bg-secondary text-secondary-foreground",
  entregue: "bg-accent text-accent-foreground",
};

export const LP_STEPS: LpStep[] = [
  {
    id: "chega",
    screen: "pendencias",
    title: "O pedido chega no mesmo dia",
    copy: "Você abre o app, entra em Pendências e registra em 30 segundos: quem pediu, o que pediu e quanto falta. Nada fica preso no papo do Direct.",
    status: "pendente",
    tab: "aba Pendências",
    track: 0,
  },
  {
    id: "paga",
    screen: "pendencias",
    title: "A cobrança sai com um toque",
    copy: "De “Falta cobrar” você manda a mensagem de cobrança no WhatsApp sem digitar nada. Quando a Maria pagar, toque em “✓ Pago” — dá para desfazer se errar.",
    status: "pago",
    tab: "aba Pendências",
    track: 1,
  },
  {
    id: "envia",
    screen: "pedidos",
    title: "Separa, posta, envia",
    copy: "Na aba Pedidos você busca qualquer pedido por cliente, produto ou valor — inclusive os 193 que vieram da planilha — e guarda o código de rastreio junto.",
    status: "enviado",
    tab: "aba Pedidos",
    track: 2,
  },
  {
    id: "volta",
    screen: "clientes",
    title: "Quando a cliente volta, o histórico está lá",
    copy: "Todo pedido fica guardado com o nome de quem comprou. Na aba Clientes você vê o que a Maria já levou e chama ela no WhatsApp ou no Instagram com um toque.",
    status: "entregue",
    tab: "aba Clientes",
    track: 3,
  },
  {
    id: "fecha",
    screen: "resumo",
    title: "O mês fecha sozinho",
    copy: "No Resumo, o faturamento do mês fica no topo, de relance: quanto entrou, quantos pedidos e os produtos mais vendidos. Sem contar na calculadora.",
    status: "entregue",
    tab: "aba Resumo",
    track: 3,
  },
];

export const LP_FUTURES: LpFuture[] = [
  {
    id: "ia",
    phase: 1,
    title: "Cole a mensagem, a IA preenche",
    copy: "Você cola o Direct ou sobe o áudio da cliente, e o pedido vem pronto para você só conferir e salvar.",
  },
  {
    id: "captura",
    phase: 2,
    title: "Os pedidos caem sozinhos",
    copy: "As mensagens das clientes chegam pelo app e viram rascunho na lista de pendências, esperando a sua aprovação.",
  },
  {
    id: "copiloto",
    phase: 3,
    title: "Um ajudante para o básico",
    copy: "Ele responde catálogo, chave Pix e prazo; quando aparece desconto ou negociação, chama você na hora.",
  },
];

export const LP_TRUST_NOTES: LpTrustNote[] = [
  { Icon: WifiOff, text: "Sem internet? Funciona igual — tudo é salvo no seu celular." },
  {
    Icon: Archive,
    text: "Apagou sem querer? O pedido sai da lista, mas fica no arquivo — dá para restaurar.",
  },
  {
    Icon: ShieldCheck,
    text: "Digitou errado? A Revisão aponta possíveis duplicados e avisos antes de virar problema.",
  },
  {
    Icon: Bell,
    text: "O app lembra você do backup: 7 dias ou 30 mudanças depois, o aviso aparece no topo.",
  },
];
