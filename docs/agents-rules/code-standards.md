# Code Standards

> Regra mestre: todo código deste repositório segue este documento. O `AGENTS.md`
> apenas referencia este arquivo — a regra vive aqui, não duplicada lá.

## 1. Código em inglês

Identificadores, comentários, logs, mensagens de erro e mensagens de commit são
escritos em inglês. Strings de interface e termos de domínio do produto (ex.:
`"pendente"`, `"Retirada"`, rótulos exibidos à usuária) podem permanecer em
português, porque são conteúdo, não código.

```ts
// ruim
const s = cliente.nome;
export function montarCsv(pedidos: Order[]) {}

// bom
const customerName = customer.name;
export function buildCsv(orders: Order[]) {}
```

## 2. Funções e métodos no máximo 5 linhas

Se passar de 5 linhas, extraia funções menores com responsabilidade única.

```ts
// ruim — 9 linhas em uma função só
export function toCSV(orders: Order[]) {
  const head = ["Nome do cliente", "produto", "Qtd", "VALOR", "Status do Pedido", "Data"];
  const rows = orders.map((o) =>
    [o.cliente, o.produto, o.qtd, o.valor.toFixed(2).replace(".", ","), o.status, fmtDate(o.data)]
      .map(sanitizeCell)
      .join(";"),
  );
  return "\uFEFF" + [head.join(";"), ...rows].join("\n");
}

// bom — orquestradora com 3 linhas, detalhes em funções separadas
export function buildCsv(orders: Order[]) {
  const header = buildCsvHeader();
  const rows = orders.map(buildCsvRow);
  return `\uFEFF${[header, ...rows].join("\n")}`;
}
```

## 3. Máximo de 3 parâmetros

Com mais de 3, agrupe em um objeto de opções tipado.

```ts
// ruim — 4 parâmetros
function updateOrder(id: string, patch: Partial<Order>, history: HistEntry[], notify: boolean) {}

// bom
type UpdateOrderOptions = {
  patch: Partial<Order>;
  history: HistEntry[];
  notify: boolean;
};

function updateOrder(id: string, options: UpdateOrderOptions) {}
```

## 4. Máximo de 2 níveis de aninhamento de if/else

Use guard clauses (retornos antecipados) para eliminar aninhamento.

```ts
// ruim — 3 níveis
function buildWhatsAppLink(phone: string) {
  if (phone) {
    let digits = phone.replace(/\D/g, "");
    if (digits) {
      if (digits.length === 10 || digits.length === 11) {
        digits = `55${digits}`;
      }
    }
  }
}

// bom — sem aninhamento
function buildWhatsAppLink(phone: string) {
  const digits = normalizePhoneDigits(phone);
  if (!digits) return "";
  if (!isLocalLength(digits)) return `https://wa.me/${digits}`;
  return `https://wa.me/55${digits}`;
}
```

## 5. Evite switch/case

Prefira mapas/lookups declarativos — ficam testáveis e fáceis de estender.

```ts
// ruim
function statusLabel(status: Status) {
  switch (status) {
    case "pendente":
      return "Aguardando pagamento";
    case "pago":
      return "Pago";
    case "enviado":
      return "Enviado";
    default:
      return status;
  }
}

// bom
const STATUS_LABELS: Record<Status, string> = {
  pendente: "Aguardando pagamento",
  pago: "Pago",
  enviado: "Enviado",
  cancelado: "Cancelado",
  devolvido: "Devolvido",
};

const statusLabel = (status: Status) => STATUS_LABELS[status] ?? status;
```

## 6. Funções e métodos iniciam com verbo

Nominais e substantivos valem para dados, não para comportamento.

```ts
// ruim
export function clientKey(name: string) {}
export const fmtBRL = (value: number) => "";
export function download(name: string, content: string, type: string) {}

// bom
export function buildClientKey(name: string) {}
export const formatBRL = (value: number) => "";
export function downloadFile(name: string, content: string, type: string) {}
```

## 7. Variáveis com nome claro e objetivo

Nada de `s`, `d`, `h`, `tmp`, `obj2`. O nome deve responder "o quê?" sem
precisar de comentário.

```ts
// ruim
const s = cliente.normalize("NFD");
const d = phone.replace(/\D/g, "");
const h = handle.trim().replace(/^@/, "");

// bom
const normalizedCustomerName = customer.normalize("NFD");
const digitsOnlyPhone = phone.replace(/\D/g, "");
const instagramHandle = handle.trim().replace(/^@/, "");
```

## 8. Cada type em arquivo próprio

Nunca agrupe tipos/interfaces no mesmo arquivo. Um tipo por arquivo, nomeado
pelo próprio tipo, dentro da pasta `types/` da camada correspondente (ver
[folder-structure.md](./folder-structure.md)).

```text
# ruim — 8 tipos em um arquivo só
src/lib/bia/types.ts

# bom — um tipo por arquivo
src/lib/bia/types/Order.ts          → export type Order = { ... }
src/lib/bia/types/Status.ts         → export type Status = ...
src/lib/bia/types/HistoryEntry.ts   → export type HistoryEntry = ...
src/lib/bia/types/AppData.ts        → export type AppData = ...
```

## Escopo de aplicação

Vale para **todo código novo ou modificado**. Código existente que ainda viola
estas regras (ex.: `src/components/bia/screens.tsx` com 330 linhas,
`src/lib/bia/store.tsx` com 170) é dívida técnica: ao tocar no arquivo, traga-o
para dentro das regras.

## Vínculos

- [AGENTS.md](../../AGENTS.md) — comandos para instalar, rodar e testar o projeto.
- [react.md](./react.md) — regras específicas de componentes React.
- [folder-structure.md](./folder-structure.md) — onde cada tipo, serviço e página vivem.
- [tests.md](./tests.md) — cobertura obrigatória para o que for implementado.
