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
- **recharts**, **sonner**, **lucide-react**, **date-fns** — gráficos, toast, ícones, datas
- **IndexedDB** (API nativa) — persistência local, sem backend

## Loja da Bia

- Os dados do app vivem em um único documento `AppData` no IndexedDB (`src/lib/bia/store.tsx`); o seed versionado contém dados sintéticos de demonstração e não há backend.
- O seed é gerado por `tools/build_seed.py` a partir de `tools/pedidos.csv`; nunca edite `src/data/seed.json` à mão.
- Cópias locais dos dados originais ficam em `private-data/originals/`, ignorada pelo Git. Dados reais não devem entrar em arquivos versionados ou bundles públicos.
- Pedidos nunca são removidos definitivamente: use flags de arquivo/exclusão — invariante sem perda (`total = imported + created`).
