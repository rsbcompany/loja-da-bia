# Tests

> Tudo que for implementado neste projeto tem que ter teste automatizado.
> Framework: **Vitest** (já configurado em `vitest.config.ts`).

## Comandos

```sh
bun run test         # roda uma vez (CI)
bun run test:watch   # modo watch (desenvolvimento)
```

## Padrão de escrita

Escolha **um** dos dois padrões e mantenha o mesmo dentro do mesmo arquivo:

- **Arrange, Act, Assert** — prepara, executa, verifica.
- **Given, When, Then** — dado o contexto, quando acontece, então espero o
  resultado.

```ts
// Arrange
const order = buildOrder({ status: "pendente", valor: 100 });
const store = createStore([order]);

// Act
store.payOrder(order.id);

// Assert
expect(store.getOrder(order.id)?.status).toBe("pago");
```

## Regras

1. **Sem dependência entre testes.** Nenhum teste pode assumir que outro rodou
   antes. Cada teste monta o próprio estado e limpa o que poluir (uso de
   `beforeEach`/`afterEach`).
2. **Sem estado global compartilhado.** Não reaproveite instância de store,
   IndexedDB ou módulo entre testes sem resetar.
3. **Dependência externa = mock/stub.** Qualquer API, rede, relógio ou
   IndexedDB usada num teste é substituída por mock/stub para o teste ser
   repetível (mesmo resultado em qualquer máquina, qualquer ordem).

```ts
// ruim — depende da API real e do horário da máquina
const orders = await fetchOrders();
expect(orders.length).toBe(193);

// bom — mock determinístico
vi.mock("@/services/orders", () => ({
  fetchOrders: vi.fn().mockResolvedValue([buildOrder()]),
}));

const orders = await fetchOrders();
expect(orders).toHaveLength(1);
```

## Camadas obrigatórias

| Camada         | O que cobre                                                                                    | Onde vive                  |
| -------------- | ---------------------------------------------------------------------------------------------- | -------------------------- |
| **Unidade**    | funções puras, hooks e serviços isolados (`lib/`, `hooks/`, `services/`)                       | `src/**/<nome>.test.ts(x)` |
| **Integração** | fluxos com múltiplos módulos juntos (store + componentes + rota)                               | `src/**/<nome>.test.tsx`   |
| **E2E**        | o usuário atravessando a tela de ponta a ponta (renderizar `/`, criar pedido, exportar backup) | `src/test/*.e2e.ts`        |

O Vitest hoje inclui `src/**/*.{test,spec}.{ts,tsx}` — escreva os arquivos com
esses sufixos.

### Camada e2e pendente

Não há runner e2e instalado (Playwright/Cypress). Enquanto não existir, os
testes de fluxo completo são escritos em nível de integração (RTL) cobrindo o
mesmo caminho do usuário.

## Cobertura mínima por mudança

- função nova → teste de unidade;
- componente/hook novo → teste de unidade do hook + teste de integração do
  componente;
- rota/tela nova → teste de integração renderizando a URL;
- regra de negócio (validação, flags, duplicados, invariante
  `total = imported + created`) → teste de unidade obrigatório.

## Situação atual

- `server/services/auth.test.ts`, `server/services/clients.test.ts` (merge de
  clientes) e `server/services/orders.test.ts` (diff de histórico) cobrem as
  regras novas do backend.
- `src/test/app-routing.test.tsx` tem **2 testes vermelhos pré-existentes**
  (índice e not-found): o `RouterProvider` do TanStack Start não pinta no
  jsdom fora do fluxo SSR/hidratação — dívida de ambiente de teste, não de
  código. Teste vermelho não é aceitável como estado final.

## Vínculos

- [AGENTS.md](../../AGENTS.md) — comandos `bun run test` / `test:watch`.
- [code-standards.md](./code-standards.md) — o teste também obedece às regras
  (função ≤ 5 linhas, nomes em inglês, 1 type por arquivo).
- [logs.md](./logs.md) — teste falho: ler o log antes de tentar corrigir.
