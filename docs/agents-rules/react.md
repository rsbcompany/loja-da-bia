# React

> Regras de componentes e hooks React. Complementa o
> [code-standards.md](./code-standards.md) — toda regra de função, parâmetro e
> nome de variável vale aqui também.

## 1. Componentes funcionais sempre

Componentes de classe não são aceitos. Todo componente é uma função que retorna
JSX e começa com letra maiúscula.

```tsx
// ruim — componente de classe
class OrderCard extends React.Component<OrderCardProps> {
  render() {
    return <div>{this.props.order.cliente}</div>;
  }
}

// bom
function OrderCard({ order }: OrderCardProps) {
  return <div>{order.customer}</div>;
}
```

## 2. Componentes no máximo 30 linhas

Passou de 30 linhas, quebre em subcomponentes ou mova lógica para
`hooks/`/`services/`.

```tsx
// ruim — 330 linhas em src/components/bia/screens.tsx
function OrdersScreen() {
  // ...busca, filtros, tabela, ações, modais, flags, arquivo
}

// bom — orquestradora curta, detalhes em arquivos próprios
function OrdersScreen() {
  const { orders, filters } = useOrders();
  return (
    <section>
      <OrdersFilters query={filters.query} status={filters.status} />
      <OrdersTable orders={orders} />
    </section>
  );
}
```

## 3. Props explícitas, sem spread operator

Nada de `{...props}` ou `{...rest}` passando dado adiante: declare cada prop.

```tsx
// ruim
function OrdersTable(props: OrdersTableProps) {
  return <table {...props} />;
}

// bom
type OrdersTableProps = {
  orders: Order[];
  onSelect: (orderId: string) => void;
  isArchived?: boolean;
};

function OrdersTable({ orders, onSelect, isArchived = false }: OrdersTableProps) {
  return <table>{/* ... */}</table>;
}
```

> Exceção única: wrappers de terceiros em `src/components/ui/` (shadcn/ui) que
> repassam props nativas do Radix. Não copie esse padrão para componentes do
> domínio em `src/components/bia/`.

## 4. Hooks com prefixo `use`

Todo hook customizado começa com `use` e vive em `src/hooks/`.

```tsx
// ruim
function isMobile() {
  /* ... */
}
function useMobile() {}

// bom — src/hooks/use-mobile.tsx
export function useIsMobile() {
  /* ... */
}
```

## 5. Sempre `useMemo` para evitar re-render desnecessário

Todo valor derivado de props/estado (filtragem, ordenação, formatação, objeto de
contexto) é memorizado. Comportamento/callbacks recorrentes usam `useCallback`.

```tsx
// ruim — recalcula a lista a cada render
function OrdersScreen({ orders, query }: Props) {
  const filtered = orders.filter((o) => o.cliente.includes(query));
  return <OrdersTable orders={filtered} />;
}

// bom
function OrdersScreen({ orders, query }: Props) {
  const filteredOrders = useMemo(
    () => orders.filter((order) => order.customerName.includes(query)),
    [orders, query],
  );
  return <OrdersTable orders={filteredOrders} />;
}
```

## Escopo de aplicação

Vale para componentes novos ou modificados. Dívida atual a resolver ao tocar no
arquivo: `src/components/bia/screens.tsx` (330 linhas),
`src/components/bia/OrderEditor.tsx` (115 linhas).

## Vínculos

- [AGENTS.md](../../AGENTS.md) — como rodar `bun run dev` e `bun run test`.
- [code-standards.md](./code-standards.md) — 5 linhas por função, 3 parâmetros, nomes.
- [tests.md](./tests.md) — todo componente alterado mantém teste verde.
