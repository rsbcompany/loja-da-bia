import { useState, type ReactNode } from "react";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/bia/store";
import { ENTREGAS, PGTOS, STATUSES, type CatalogItem, type Order } from "@/lib/bia/types";
import { fmtBRL, fmtDate } from "@/lib/bia/format";
import { nextQtdForm } from "@/lib/bia/order-form";
import { useOrderForm } from "@/hooks/use-order-form";
import type { OrderForm } from "@/types/OrderForm";
import { Btn, Chip, Field, inputCls, Sheet } from "./ui";
import { cn } from "@/lib/utils";

export function OrderEditor({
  order,
  open,
  onClose,
}: {
  order?: Order | undefined;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return <Inner key={order?.id ?? "new"} order={order} onClose={onClose} />;
}

function Inner({ order, onClose }: { order?: Order | undefined; onClose: () => void }) {
  const { form, set, setQtd, clientes, catalog, price, dirty, extrasOpen, setExtrasOpen, save } =
    useOrderForm(order);
  const [confirmClose, setConfirmClose] = useState(false);
  const saveAndClose = () => {
    if (save()) onClose();
  };
  const requestClose = () => {
    if (dirty) setConfirmClose(true);
    else onClose();
  };
  return (
    <Sheet
      open
      title={order ? "Editar pedido" : "Novo pedido"}
      onClose={requestClose}
      footer={
        confirmClose ? (
          <div className="flex gap-2">
            <Btn className="flex-1" onClick={() => setConfirmClose(false)}>
              Continuar editando
            </Btn>
            <Btn variant="ghost" className="flex-1 text-destructive" onClick={onClose}>
              Descartar
            </Btn>
          </div>
        ) : (
          <Btn className="w-full text-base" onClick={saveAndClose}>
            {order ? "Salvar alterações" : "Registrar pedido"}
          </Btn>
        )
      }
    >
      <div className="space-y-4">
        <CoreFields
          form={form}
          set={set}
          clientes={clientes}
          catalog={catalog}
          onPrice={price}
          isEdit={!!order}
        />
        <AmountFields form={form} set={set} onPrice={price} />
        <StatusFields form={form} set={set} />
        <ExtrasDisclosure open={extrasOpen} onToggle={() => setExtrasOpen(!extrasOpen)}>
          <ExtrasFields form={form} set={set} />
        </ExtrasDisclosure>
        {order && <EditorMeta order={order} onClose={onClose} />}
      </div>
    </Sheet>
  );
}

function CoreFields({
  form,
  set,
  clientes,
  catalog,
  onPrice,
  isEdit,
}: {
  form: OrderForm;
  set: (patch: Partial<OrderForm>) => void;
  clientes: string[];
  catalog: CatalogItem[];
  onPrice: (nome: string) => number | undefined;
  isEdit: boolean;
}) {
  return (
    <>
      <Field label="Cliente" id="editor-cliente">
        <input
          id="editor-cliente"
          className={inputCls}
          list="bia-clientes"
          value={form.cliente}
          onChange={(e) => set({ cliente: e.target.value })}
          autoFocus={!isEdit}
        />
      </Field>
      <datalist id="bia-clientes">
        {clientes.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <Field label="Produto" id="editor-produto">
        <input
          id="editor-produto"
          className={inputCls}
          list="bia-produtos"
          value={form.produto}
          onChange={(e) => {
            const preco = onPrice(e.target.value);
            set({
              produto: e.target.value,
              ...(preco ? { valor: (preco * form.qtd).toFixed(2).replace(".", ",") } : {}),
            });
          }}
        />
      </Field>
      <datalist id="bia-produtos">
        {catalog.map((c) => (
          <option key={c.nome} value={c.nome}>
            {fmtBRL(c.preco)}
          </option>
        ))}
      </datalist>
      <Field label="Data" id="editor-data">
        <input
          id="editor-data"
          type="date"
          className={inputCls}
          value={form.data}
          onChange={(e) => set({ data: e.target.value })}
        />
      </Field>
    </>
  );
}

function AmountFields({
  form,
  set,
  onPrice,
}: {
  form: OrderForm;
  set: (patch: Partial<OrderForm>) => void;
  onPrice: (nome: string) => number | undefined;
}) {
  const setQtd = (next: number) => set(nextQtdForm(form, next, onPrice(form.produto)));
  return (
    <div className="flex gap-3">
      <Field label="Quantidade">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Menos"
            className="grid size-12 place-items-center rounded-md bg-white/50 backdrop-blur-md"
            onClick={() => setQtd(form.qtd - 1)}
          >
            <Minus />
          </button>
          <span className="w-8 text-center text-lg font-semibold tabular-nums">{form.qtd}</span>
          <button
            type="button"
            aria-label="Mais"
            className="grid size-12 place-items-center rounded-md bg-white/50 backdrop-blur-md"
            onClick={() => setQtd(form.qtd + 1)}
          >
            <Plus />
          </button>
        </div>
      </Field>
      <Field label="Valor total (R$)" id="editor-valor">
        <input
          id="editor-valor"
          className={inputCls + " text-base font-semibold"}
          inputMode="decimal"
          value={form.valor}
          onChange={(e) => set({ valor: e.target.value })}
        />
      </Field>
    </div>
  );
}

function StatusFields({
  form,
  set,
}: {
  form: OrderForm;
  set: (patch: Partial<OrderForm>) => void;
}) {
  return (
    <>
      <Field label="Status">
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <Chip key={s.id} active={form.status === s.id} onClick={() => set({ status: s.id })}>
              {s.id === "pendente" ? "Pendente" : s.label}
            </Chip>
          ))}
        </div>
      </Field>
      <Field label="Pagamento">
        <div className="flex flex-wrap gap-2">
          {PGTOS.map((p) => (
            <Chip
              key={p}
              active={form.pgto === p}
              onClick={() => set({ pgto: form.pgto === p ? "" : p })}
            >
              {p}
            </Chip>
          ))}
        </div>
      </Field>
    </>
  );
}

function ExtrasDisclosure({
  open,
  onToggle,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex min-h-10 items-center gap-1 text-sm font-semibold text-primary"
      >
        Mais detalhes{" "}
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="space-y-4">{children}</div>}
    </div>
  );
}

function ExtrasFields({
  form,
  set,
}: {
  form: OrderForm;
  set: (patch: Partial<OrderForm>) => void;
}) {
  return (
    <>
      <Field label="Detalhe (cor, tamanho…)" id="editor-detalhe">
        <input
          id="editor-detalhe"
          className={inputCls}
          value={form.detalhe}
          onChange={(e) => set({ detalhe: e.target.value })}
        />
      </Field>
      <Field label="Entrega">
        <div className="flex flex-wrap gap-2">
          {ENTREGAS.map((p) => (
            <Chip
              key={p}
              active={form.entrega === p}
              onClick={() => set({ entrega: form.entrega === p ? "" : p })}
            >
              {p}
            </Chip>
          ))}
        </div>
      </Field>
      <Field label="Código de rastreio (opcional)" id="editor-rastreio">
        <input
          id="editor-rastreio"
          className={inputCls + " uppercase"}
          placeholder="BR123456789"
          autoCapitalize="characters"
          value={form.rastreio}
          onChange={(e) => set({ rastreio: e.target.value })}
        />
      </Field>
      <Field label="Observações" id="editor-obs">
        <textarea
          id="editor-obs"
          className={inputCls + " min-h-20 py-2"}
          value={form.obs}
          onChange={(e) => set({ obs: e.target.value })}
        />
      </Field>
    </>
  );
}

function EditorMeta({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <>
      <OriginNote order={order} />
      <HistoryList order={order} />
      <DeleteControls order={order} onClose={onClose} />
    </>
  );
}

function OriginNote({ order }: { order: Order }) {
  if (!order.linhaOrigem) return null;
  return (
    <div className="rounded-lg bg-white/50 backdrop-blur-md p-4 text-sm">
      <p className="mb-2 font-semibold">Original da planilha (linha {order.linhaOrigem})</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-muted-foreground">
        <dt>Cliente</dt>
        <dd>{order.clienteOriginal || "—"}</dd>
        <dt>Status</dt>
        <dd>{order.statusOriginal || "—"}</dd>
        <dt>Data</dt>
        <dd>{order.dataOriginal || "—"}</dd>
        <dt>Valor</dt>
        <dd>{order.valorOriginal || "—"}</dd>
        <dt>Pgto</dt>
        <dd>{order.pgtoOriginal || "—"}</dd>
      </dl>
    </div>
  );
}

function HistoryList({ order }: { order: Order }) {
  if (order.historico.length === 0) return null;
  return (
    <div className="text-sm">
      <p className="mb-2 font-semibold">Histórico de alterações</p>
      <ul className="space-y-1 text-muted-foreground">
        {order.historico
          .slice()
          .reverse()
          .map((entry, index) => (
            <li key={index}>
              {fmtDate(entry.ts.slice(0, 10))} · <b>{entry.campo}</b>: {entry.de || "—"} →{" "}
              {entry.para || "—"}
            </li>
          ))}
      </ul>
    </div>
  );
}

function DeleteControls({ order, onClose }: { order: Order; onClose: () => void }) {
  const { updateOrder } = useStore();
  const [confirmDel, setConfirmDel] = useState(false);
  const confirmDelete = () => {
    updateOrder(order.id, { excluido: true });
    toast("Pedido excluído (recuperável pelo backup)");
    onClose();
  };
  const restore = () => {
    updateOrder(order.id, { excluido: false });
    onClose();
  };
  if (order.excluido)
    return (
      <Btn variant="ghost" className="w-full" onClick={restore}>
        Restaurar pedido
      </Btn>
    );
  if (confirmDel)
    return (
      <div className="flex gap-2">
        <Btn variant="danger" className="flex-1" onClick={confirmDelete}>
          Confirmar exclusão
        </Btn>
        <Btn variant="ghost" onClick={() => setConfirmDel(false)}>
          Cancelar
        </Btn>
      </div>
    );
  return (
    <Btn variant="ghost" className="w-full text-destructive" onClick={() => setConfirmDel(true)}>
      Excluir pedido
    </Btn>
  );
}
