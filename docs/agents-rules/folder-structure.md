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
├── services/          # acesso a dados do cliente: IndexedDB, APIs, export/import
├── pages/             # camada de páginas  →  na prática é src/routes/ (ver abaixo)
├── lib/               # funções puras sem estado (format, validação, links)
├── routes/            # file-based routing do TanStack Start (camada HTTP/URL)
├── data/              # seed.json e csv de origem (gerados, não editados à mão)
├── test/              # testes de integração/e2e e setup do Vitest
├── styles.css         # Tailwind v4
├── router.tsx         # criação do router
└── server.ts          # entry SSR (wrapper de erro) — migra para server/ quando houver backend
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

## Backend — `server/` (alvo, ainda não existe)

Hoje não há backend: o app é local-first (IndexedDB, sem servidor próprio).
Quando houver, a estrutura é:

```text
server/
├── routes/     # SOMENTE tratamento de requisições HTTP (parse, status, resposta)
├── services/   # regras de negócio (nunca fala com HTTP nem com o banco direto)
├── data/       # acesso a banco de dados, APIs externas e outras integrações
└── types/      # 1 type/interface por arquivo
```

Fluxo obrigatório: `routes → services → data`. Nunca pule camadas.

```text
# ruim — a rota faz negócio e consulta o banco
server/routes/orders.ts        app.post(...) { const rows = db.query(...) }

# bom — cada camada na sua pasta
server/routes/orders.ts        app.post(...)  → createOrder(input)
server/services/orders.ts      createOrder(input)  → ordersRepository.insert(row)
server/data/orders.ts          ordersRepository.insert(row) → db.query(...)
```

Enquanto o backend não existir, o código server-side atual vive em
`src/server.ts` (wrapper de erro SSR) e `src/start.ts` (middlewares) e migra
para `server/routes/` no momento em que a camada de API for criada.

## Regras de criação de pastas

Seguem o [code-standards.md](./code-standards.md):

1. Nome de pasta e arquivo em **inglês** (`components/`, `services/`, `Order.ts`).
2. Uma responsabilidade por pasta — nada de `utils/` ou `helpers/` que vira lixeira.
3. `types/`: **um type por arquivo**, nomeado pelo tipo (`Order.ts`, `Status.ts`).
4. `services/`: funções iniciam com verbo e têm no máximo 5 linhas.
5. `hooks/`: prefixo obrigatório `use-` / `useX`.
6. Nunca criar `src/pages/`, `src/app/` ou `app/layout.tsx`.

## Mapa atual → alvo

| Hoje                                                  | Alvo                                                                       |
| ----------------------------------------------------- | -------------------------------------------------------------------------- |
| `src/lib/bia/types.ts` (8 tipos juntos)               | `src/lib/bia/types/<Tipo>.ts` (1 por arquivo)                              |
| `src/lib/bia/store.tsx` (estado + regras + IndexedDB) | `src/services/` (regras) + `src/services/` de persistência                 |
| `src/lib/bia/format.ts` (funções puras)               | `src/lib/` (mantém)                                                        |
| `src/components/bia/screens.tsx` (330 linhas)         | quebrar em páginas de `src/routes/` + componentes de `src/components/bia/` |
| `src/server.ts` / `src/start.ts`                      | `server/routes/` quando houver API                                         |

## Vínculos

- [AGENTS.md](../../AGENTS.md) — comandos, portas e dependências.
- [code-standards.md](./code-standards.md) — regras de escrita de código.
- [react.md](./react.md) — regras de componentes.
