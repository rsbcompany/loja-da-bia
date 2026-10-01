# Database

> Regras de acesso a dados. O projeto tem **dois contextos**: o atual
> (local-first em IndexedDB) e o genérico (SQL), que passa a valer assim que
> existir camada relacional — ver [folder-structure.md](./folder-structure.md)
> para `server/data/`.

---

## Parte A — Contexto atual: IndexedDB (local-first)

O app não tem servidor. Todos os dados vivem em **um único documento `AppData`**
no IndexedDB (`src/lib/bia/store.tsx`), semeado uma vez a partir de
`src/data/seed.json`.

### A0. Dados reais não entram no repositório público

`tools/pedidos.csv`, `src/data/original.csv` e `src/data/seed.json` versionados
contêm apenas dados sintéticos de demonstração. As cópias reais ficam em
`private-data/originals/`, ignorada pelo Git. O `.gitignore` evita publicação
acidental, mas **não criptografa** os arquivos nem substitui controle de acesso.

Não importe dados reais para o seed público nem para `public/`/bundles. Para
uso compartilhado ou deploy, configure uma API autenticada ligada a um banco
privado antes de carregar registros reais; a aplicação atual continua local-first.

### A1. Toda leitura/escrita é validada antes de persistir

Antes de salvar, rode a validação (`validateBackup` / schema) e confirme que a
estrutura esperada está íntegra. Query sem validação é query a cegas.

### A2. Use os dados como sensor de feedback

Depois de cada implementação, leia de volta o que foi gravado e confirme que os
registros esperados estão presentes. O resultado da leitura dita o próximo
passo — não a intenção do código.

```ts
// ruim — grava e segue, sem conferir
await idbSet(nextData);

// bom — grava, relê e confirma a invariante
await idbSet(nextData);
const persisted = await idbGet();
assertTotalIsPreserved(persisted); // total = imported + created
```

### A3. Invariante sem perda

`total = imported + created` nunca pode mudar por acidente. Pedido nunca é
removido: só `arquivado` / `excluido` (flags). Toda função que mexe em pedido
deve ser testada contra essa invariante — ver [tests.md](./tests.md).

### A4. Índices / object stores

O store atual é `kv` com uma chave só (`data`). Ao criar novo object store ou
índice dentro do IndexedDB, declare junto com o store (mesma version bump) e
aponte o campo que vira alvo de consulta — espelho do índice obrigatório do
SQL abaixo.

### A5. Seed é gerado, não editado

`src/data/seed.json` é produzido por `python3 tools/build_seed.py` a partir de
`tools/pedidos.csv`. Nunca edite o JSON à mão: rode o script (comando no
[AGENTS.md](../../AGENTS.md)).

---

## Parte B — Contexto SQL (psql), para quando existir banco relacional

> Ativa a partir do momento em que `server/data/` falar com um banco. Enquanto
> isso não existe, esta parte é padrão obrigatório do dia em que nascer.

### B1. Toda query é validada no psql

Nenhuma query vai para o código sem antes ser executada e conferida no `psql`.
O SQL escrito no repositório e o SQL rodado no banco têm que ser o mesmo.

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

Mesma invariante da Parte A: nada é apagado de forma definitiva. UPDATE com
flag de exclusão/arquivo (`deleted_at`, `archived_at`) e testes cobrindo o
total — ver [tests.md](./tests.md).

---

## Vínculos

- [AGENTS.md](../../AGENTS.md) — comandos (instalar, rodar, seed).
- [folder-structure.md](./folder-structure.md) — `server/data/` é a única pasta
  que fala com banco/API.
- [tests.md](./tests.md) — toda query/regra de dados tem teste automatizado.
- [logs.md](./logs.md) — erro de query: ler o log antes de corrigir.
