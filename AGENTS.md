# AGENTS.md

Regras de escrita de código não vivem aqui — este arquivo só **referencia** os
arquivos de regra em [`docs/agents-rules/`](docs/agents-rules/). Ao começar uma
tarefa, leia a rule correspondente antes de escrever código.

## Rules

| Arquivo                                                      | Regra                                                                                                                                                                 |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [code-standards.md](docs/agents-rules/code-standards.md)     | padrões gerais: código em inglês, funções ≤ 5 linhas, ≤ 3 parâmetros, aninhamento ≤ 2, sem `switch/case`, funções começam com verbo, nomes claros, 1 type por arquivo |
| [folder-structure.md](docs/agents-rules/folder-structure.md) | estrutura de pastas frontend (`src/`) e backend (`server/`: routes, services, data, types)                                                                            |
| [react.md](docs/agents-rules/react.md)                       | componentes funcionais, ≤ 30 linhas, props sem spread, hooks com `use`, `useMemo` sempre                                                                              |
| [tests.md](docs/agents-rules/tests.md)                       | tudo com teste automatizado em Vitest (AAA/GWT, testes independentes, mocks, unidade/integração/e2e)                                                                  |
| [database.md](docs/agents-rules/database.md)                 | validação de dados (IndexedDB atual) + `psql`, `EXPLAIN ANALYZE` e índice para todo `WHERE`                                                                           |
| [logs.md](docs/agents-rules/logs.md)                         | saída de processo em arquivo de log, ler o log em qualquer problema, log como feedback                                                                                |

## Comandos

Gerenciador de dependências: **bun** (`bunfig.toml` + `bun.lock`).

```sh
bun install          # instalar dependências
bun run dev          # dev server
bun run build        # build de produção
bun run build:dev    # build em modo development
bun run preview      # serve o build
bun run lint         # eslint
bun run format       # prettier --write
bun run test         # vitest (uma vez)
bun run test:watch   # vitest em watch
```

Seed (Python, gera `src/data/seed.json` — nunca editar o JSON à mão):

```sh
python3 tools/build_seed.py
```

Banco de dados (Postgres privado na Neon; `DATABASE_URL` no `.env`):

```sh
bun run db:generate            # gerar SQL de migration (drizzle-kit)
bun run db:migrate             # aplicar migrations
bun run db:owner <email> <senha>   # bootstrap: cria a primeira conta (uso único)
bun run db:import <seed.json> <email>  # importar dados (sintético ou real) para a conta
```

## Portas

| Serviço           | Porta  | Comando           |
| ----------------- | ------ | ----------------- |
| Dev server (Vite) | `5173` | `bun run dev`     |
| Preview do build  | `4173` | `bun run preview` |

Build de produção sai em `.output/` (preset Nitro `cloudflare-module`).

## Principais dependências

- **React 19** + **TanStack** (`react-start`, `react-router`, `react-query`) — framework e roteamento
- **Tailwind CSS 4** + **shadcn/ui** (Radix) — estilo e componentes de UI
- **Zod** + **react-hook-form** — validação e formulários
- **Vitest** + **Testing Library** + **jsdom** — testes
- **Drizzle ORM** + **Neon** (`@neondatabase/serverless`) — Postgres privado, migrations versionadas
- **TanStack Query** — cache/estado assíncrono do cliente
- **recharts**, **sonner**, **lucide-react**, **date-fns** — gráficos, toast, ícones, datas

## Loja da Bia

- Os dados do app vivem em um **Postgres privado (Neon)** acessado por backend autenticado: sessão em cookie `HttpOnly` (`ldb_session`), camada RPC em `src/services/api.ts` (`createServerFn`), regras de negócio em `server/services/`, acesso a dados em `server/data/` (Drizzle). **Sem IndexedDB** — o servidor é a única fonte da verdade.
- Setup inicial: `cp .env.example .env` (DATABASE_URL da Neon) → `bun run db:migrate` → `bun run db:owner <email> <senha>` → `bun run db:import <seed.json> <email>`.
- O seed versionado (`src/data/seed.json`) é gerado por `tools/build_seed.py` e contém dados **sintéticos** de demonstração; dados reais ficam em `private-data/originals/` (ignorada pelo Git) e entram no banco só via `db:import` — nunca em arquivos versionados.
- Pedidos nunca são removidos definitivamente: use flags de arquivo/exclusão — invariante sem perda (`total = imported + created`); o histórico de alterações por campo é a trilha de auditoria.
