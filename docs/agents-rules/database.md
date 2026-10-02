# Database

> Regras de acesso a dados. Desde a **Fase 0**, o app roda com **backend
> autenticado + Postgres privado (Neon)** — a Parte B (SQL) é o padrão ativo.
> A Parte A (IndexedDB) fica como registro histórico da era local-first.

---

## Parte B — Contexto SQL (psql) — ATIVO

### B1. Toda query é validada no psql

Nenhuma query vai para o código sem antes ser executada e conferida no `psql`.
O SQL escrito no repositório e o SQL rodado no banco têm que ser o mesmo. O
schema vive em `server/data/schema.ts` (Drizzle); migrations versionadas em
`drizzle/` são aplicadas com `bun run db:migrate`.

### B2. Sempre `EXPLAIN ANALYZE`

Após implementar qualquer query, rode:

```sql
EXPLAIN ANALYZE
SELECT * FROM orders WHERE customer_key = 'bia-silva' AND status = 'pendente';
```

Interprete `Execution Time` e `Planning Time`, confirme se o plano escolheu
índice (Index Scan) ou fez varredura (Seq Scan) e registre o impacto antes de
commitar. Query lenta é bug.

### B3. Índice para toda cláusula `WHERE`

Toda coluna usada em `WHERE` ganha índice. Escolha o tipo de índice apropriado
ao dado:

| Tipo do dado / uso               | Índice                                                           | Exemplo                       |
| -------------------------------- | ---------------------------------------------------------------- | ----------------------------- |
| Chave de igualdade, texto curto  | B-tree                                                           | `customer_key`                |
| Data/hora (intervalo, ordenação) | B-tree sobre `timestamptz` (ou BRIN em tabela grande e ordenada) | `created_at`                  |
| Faixa numérica larga             | BRIN                                                             | `valor` em tabela append-only |
| Texto completo                   | GIN (pg_trgm / tsvector)                                         | busca em `produto`            |
| JSONB                            | GIN                                                              | `payload @> ...`              |
| Geométrico                       | GiST                                                             | —                             |

```sql
-- ruim — WHERE sem índice
CREATE TABLE orders (customer_key text, status text);

-- bom — índice declarado junto com a coluna filtrável
CREATE INDEX idx_orders_customer_status ON orders (customer_key, status);
CREATE INDEX idx_orders_created_at ON orders USING brin (created_at);
```

Depois de criar, rode `EXPLAIN ANALYZE` de novo e confirme a troca de plano.

### B4. Banco como sensor de feedback

Use as queries para retroalimentar a implementação: confirme que os registros
esperados existem, conte agregados (`COUNT`, `SUM`) e compare com o esperado.
Se o resultado divergir do que o código presume, corrija o código — não o
número.

```sql
SELECT status, COUNT(*) FROM orders GROUP BY status ORDER BY COUNT(*) DESC;
```

### B5. Sem hard-delete

Nada é apagado de forma definitiva: exclusão por flags (`arquivado`, `excluido` —
sem `DELETE` em pedidos), invariante `total = imported + created` e testes
cobrindo o total — ver [tests.md](./tests.md).

---

## Parte A — Histórico: IndexedDB (removido na Fase 0)

Regras ainda válidas herdadas da era local-first:

- **Dados reais não entram no repositório público.** Os arquivos versionados
  (`tools/pedidos.csv`, `src/data/original.csv`, `src/data/seed.json`) contêm
  apenas dados sintéticos. Cópias reais vivem em `private-data/originals/`
  (ignorada pelo Git) e entram no banco privado só via `bun run db:import` —
  o `.gitignore` evita publicação acidental, mas **não substitui controle de
  acesso**.
- **Use os dados como sensor de feedback:** depois de cada mudança, leia de
  volta o que foi gravado e confirme que os registros esperados estão lá
  (agora: `psql`/`COUNT` — ver B4).
- **Seed é gerado, não editado:** `src/data/seed.json` vem de
  `python3 tools/build_seed.py`.

---

## Vínculos

- [AGENTS.md](../../AGENTS.md) — comandos (instalar, rodar, seed, db:*).
- [folder-structure.md](./folder-structure.md) — `server/data/` é a única pasta
  que fala com o banco; HTTP fica em `src/services/api.ts`.
- [tests.md](./tests.md) — toda query/regra de dados tem teste automatizado.
- [logs.md](./logs.md) — erro de query: ler o log antes de corrigir.
