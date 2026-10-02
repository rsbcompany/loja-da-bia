# Folder Structure

> Estrutura-alvo do projeto. Não é obrigatório criar as pastas agora: este
> documento define onde cada coisa **deve** nascer quando for criada, e para onde
> o código atual migra.
> Segue as regras do [code-standards.md](./code-standards.md).

## Frontend — `src/`

```text
src/
├── components/        # UI reutilizável
│   ├── ui/            # primitivos shadcn/ui (button, dialog, table...)
│   └── bia/           # componentes de domínio (OrderEditor, screens...)
├── hooks/             # hooks customizados, sempre com prefixo use-
├── types/             # 1 type/interface por arquivo (ver code-standards §8)
├── services/          # camada RPC/HTTP: createServerFn → server/services
├── pages/             # camada de páginas  →  na prática é src/routes/ (ver abaixo)
├── lib/               # funções puras sem estado (format, validação, links)
├── routes/            # file-based routing do TanStack Start (camada HTTP/URL)
├── data/              # seed.json e csv de origem (gerados, não editados à mão)
├── test/              # testes de integração/e2e e setup do Vitest
├── styles.css         # Tailwind v4
├── router.tsx         # criação do router
└── server.ts          # encanamento SSR do TanStack Start (wrapper de erro) — permanece em src/
```

### `pages/` ≡ `src/routes/`

O TanStack Start usa roteamento por arquivo: **não crie `src/pages/`** (é
convenção de Next.js/Remix e está proibido por `src/routes/README.md`). A camada
de páginas é `src/routes/`:

| Página         | Arquivo                        |
| -------------- | ------------------------------ |
| `/`            | `src/routes/index.tsx`         |
| `/pedidos`     | `src/routes/pedidos/index.tsx` |
| `/pedidos/$id` | `src/routes/pedidos/$id.tsx`   |

`routeTree.gen.ts` é gerado automaticamente — nunca editar à mão.

## Backend — `server/` (existe desde a Fase 0)

```text
server/
├── services/   # regras de negócio (nunca fala com HTTP nem monta SQL direto)
├── data/       # schema Drizzle, client do banco e repositórios (único acesso a SQL)
└── types/      # 1 type/interface por arquivo
```

A camada HTTP/RPC é o `src/services/api.ts`: cada endpoint é um
`createServerFn` (mecanismo de rotas de servidor do TanStack Start) que **só**
parseia entrada, resolve a sessão e delega a um service. Fluxo obrigatório:

```text
componente → src/services/api.ts (RPC/HTTP) → server/services (regras) → server/data (SQL)
```

```text
# ruim — o handler faz negócio e consulta o banco
createServerFn().handler(async () => { await db.select()... })

# bom — cada camada na sua pasta
createServerFn().handler(...)        → updateOrder(db, input)
server/services/orders.ts            → updateOrder valida, diffa histórico e grava
server/data/orders.ts                → updateOrderRow monta o UPDATE via Drizzle
```

`src/server.ts` (wrapper de erro SSR) e `src/start.ts` (middlewares) continuam
em `src/` como encanamento do TanStack Start — não são endpoints de API.

## Regras de criação de pastas

Seguem o [code-standards.md](./code-standards.md):

1. Nome de pasta e arquivo em **inglês** (`components/`, `services/`, `Order.ts`).
2. Uma responsabilidade por pasta — nada de `utils/` ou `helpers/` que vira lixeira.
3. `types/`: **um type por arquivo**, nomeado pelo tipo (`Order.ts`, `Status.ts`).
4. `services/`: funções iniciam com verbo e têm no máximo 5 linhas.
5. `hooks/`: prefixo obrigatório `use-` / `useX`.
6. Nunca criar `src/pages/`, `src/app/` ou `app/layout.tsx`.

## Mapa atual → alvo

| Hoje                                               | Alvo                                                                       |
| -------------------------------------------------- | -------------------------------------------------------------------------- |
| `src/lib/bia/types.ts` (vários tipos juntos)       | `src/types/<Tipo>.ts` (1 por arquivo)                                      |
| `src/lib/bia/store.tsx` (contexto + telas de boot) | manter contrato `useStore`; extrair telas de boot para `components/bia/`   |
| `src/lib/bia/format.ts` (funções puras)            | `src/lib/` (mantém)                                                        |
| `src/components/bia/screens.tsx` (330 linhas)      | quebrar em páginas de `src/routes/` + componentes de `src/components/bia/` |
| `src/server.ts` / `src/start.ts`                   | permanecem como encanamento SSR do TanStack Start                          |

## Vínculos

- [AGENTS.md](../../AGENTS.md) — comandos, portas e dependências.
- [code-standards.md](./code-standards.md) — regras de escrita de código.
- [react.md](./react.md) — regras de componentes.
