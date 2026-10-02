# Loja da Bia

App para a gestão de pedidos da Loja da Bia: pendências, novo pedido com
catálogo, pedidos com busca/filtros e trilha de auditoria, clientes com links
diretos para WhatsApp e Instagram, resumo financeiro mensal, revisão de
duplicados e backup. Os dados vivem em um **Postgres privado** atrás de um
backend autenticado (sessão por cookie `HttpOnly`).

## Funcionalidades

- **Pendências** — fila de pedidos com flags (status desconhecido, valor
  ilegível, data inválida etc.) para revisão.
- **Novo pedido** — catálogo com preços derivados do seed e campos
  estruturados (produto, quantidade, pagamento, entrega, observações).
- **Pedidos** — busca e filtros, com trilha de auditoria (histórico de cada
  alteração por campo).
- **Clientes** — variantes de nome agrupadas, endereços/notas e links diretos
  para WhatsApp e Instagram.
- **Resumo** — fechamento financeiro mensal dos pedidos ativos.
- **Revisão** — possíveis duplicados (exatos e aproximados) para revisão
  manual; nada é excluído automaticamente.
- **Backup** — exportação/importação em JSON e CSV, com aviso de backup
  pendente na tela inicial.
- **Sobre** — informações do app.

## Privacidade dos dados

- O app fala com um **backend autenticado + Postgres privado (Neon)**; nada de
  dado sensível fica no navegador ou no bundle público (a leitura local via
  IndexedDB foi removida).
- Os dados versionados são **sintéticos de demonstração**, gerados por
  `tools/build_seed.py` a partir de `tools/pedidos.csv`.
- Cópias dos dados originais ficam em `private-data/originals/`, pasta
  ignorada pelo Git. **Nunca publique dados reais** (nomes, telefones,
  Instagram) em arquivos versionados — eles entram no banco privado apenas via
  `bun run db:import`.
- Pedidos nunca são removidos definitivamente: apenas flags de
  arquivamento/exclusão, preservando a invariante `total = imported + created`.

## Desenvolvimento

Requisitos: [Bun](https://bun.sh) e Python 3.

| Comando               | Ação                                                      |
| --------------------- | --------------------------------------------------------- |
| `bun install`         | instalar dependências                                     |
| `bun run dev`         | dev server em `http://localhost:5173`                     |
| `bun run build`       | build de produção (saída em `.output/`, Nitro/Cloudflare) |
| `bun run preview`     | serve o build em `http://localhost:4173`                  |
| `bun run test`        | Vitest (uma vez)                                          |
| `bun run test:watch`  | Vitest em watch                                           |
| `bun run lint`        | ESLint                                                    |
| `bun run format`      | Prettier                                                  |
| `bun run db:generate` | gerar SQL de migration (drizzle-kit)                      |
| `bun run db:migrate`  | aplicar migrations no Postgres                            |

### Setup do banco (primeira vez)

```sh
cp .env.example .env       # preencha DATABASE_URL com a connection string da Neon
bun run db:migrate         # cria as tabelas
bun run db:owner <email> <senha>   # cria a primeira conta (uso único)
bun run db:import src/data/seed.json <email>   # importa o seed sintético
```

Para regenerar o seed sintético (nunca editar `src/data/seed.json` à mão):

```sh
python3 tools/build_seed.py
```

## Stack

- **React 19** + **TanStack Start / Router / Query** — framework, roteamento
  file-based, RPC do servidor e estado assíncrono
- **Tailwind CSS 4** + **shadcn/ui** (Radix) — estilo e componentes de UI
- **Zod** + **react-hook-form** — validação e formulários
- **Drizzle ORM** + **Neon** (`@neondatabase/serverless`) — Postgres privado,
  migrations versionadas
- **Vitest** + **Testing Library** + **jsdom** — testes

## Roadmap

Confira [roadmap.md](roadmap.md):

- **Fase 0** — nova base de dados: backend autenticado + banco privado
- **Fase 1** — higienização e contato rápido (máscara de telefone, atalho de
  WhatsApp)
- **Fase 2** — assistente de IA para entrada rápida de pedidos
- **Fase 3** — captura automática em segundo plano (webhooks)
- **Fase 4** — agente copiloto ativo (atendimento autônomo com transbordo
  humano)

## Regras do projeto

Os padrões de código e as regras do time vivem em
[docs/agents-rules/](docs/agents-rules/), indexados pelo [AGENTS.md](AGENTS.md):
code standards, estrutura de pastas, React, testes, banco de dados e logs.
