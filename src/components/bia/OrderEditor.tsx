import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/bia/store";
import { ENTREGAS, PGTOS, STATUSES, type Entrega, type Order, type Status } from "@/lib/bia/types";
import { fmtBRL, fmtDate, todayISO } from "@/lib/bia/format";
import { Btn, Chip, Field, inputCls, Sheet } from "./ui";

export function OrderEditor({ order, open, onClose }: { order?: Order | undefined; open: boolean; onClose: () => void }) {
  if (!open) return null;
  return <Inner key={order?.id ?? "new"} order={order} onClose={onClose} />;
}

function Inner({ order, onClose }: { order?: Order | undefined; onClose: () => void }) {
  const { data, addOrder, updateOrder } = useStore();
  const [f, setF] = useState({
    cliente: order?.cliente ?? "", produto: order?.produto ?? "", qtd: order?.qtd ?? 1,
    valor: order ? String(order.valor).replace(".", ",") : "", status: (order?.status ?? "pendente") as Status,
    data: order?.data ?? todayISO(), pgto: order?.pgto ?? "", obs: order?.obs ?? "",
    detalhe: order?.detalhe ?? "", entrega: (order?.entrega ?? "") as Entrega,
  });
  const [confirmDel, setConfirmDel] = useState(false);
  const set = (p: Partial<typeof f>) => setF((x) => ({ ...x, ...p }));
  const price = (nome: string) => data?.catalog.find((c) => c.nome.toLowerCase() === nome.toLowerCase())?.preco;
  const clientes = useMemo(() => data?.clients.map((c) => c.nome).sort() ?? [], [data]);

  const setQtd = (q: number) => {
    q = Math.max(1, q);
    const unit = price(f.produto) ?? (f.qtd ? parseVal(f.valor) / f.qtd : 0);
    set({ qtd: q, valor: unit ? (unit * q).toFixed(2).replace(".", ",") : f.valor });
  };
  const save = () => {
    if (!f.cliente.trim() || !f.produto.trim()) { toast.error("Informe cliente e produto"); return; }
    const payload = { ...f, cliente: f.cliente.trim(), produto: f.produto.trim(), valor: parseVal(f.valor) };
    if (order) updateOrder(order.id, payload);
    else addOrder(payload);
    toast.success(order ? "Pedido atualizado" : "Pedido registrado");
    onClose();
  };

  return (
    <Sheet open title={order ? "Editar pedido" : "Novo pedido"} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Cliente">
          <input className={inputCls} list="bia-clientes" value={f.cliente} onChange={(e) => set({ cliente: e.target.value })} autoFocus={!order} />
          <datalist id="bia-clientes">{clientes.map((c) => <option key={c} value={c} />)}</datalist>
        </Field>
        <Field label="Produto">
          <input className={inputCls} list="bia-produtos" value={f.produto}
            onChange={(e) => { const p = price(e.target.value); set({ produto: e.target.value, ...(p ? { valor: (p * f.qtd).toFixed(2).replace(".", ",") } : {}) }); }} />
          <datalist id="bia-produtos">{data?.catalog.map((c) => <option key={c.nome} value={c.nome}>{fmtBRL(c.preco)}</option>)}</datalist>
        </Field>
        <Field label="Detalhe (cor, tamanho…)"><input className={inputCls} value={f.detalhe} onChange={(e) => set({ detalhe: e.target.value })} /></Field>
        <div className="flex gap-3">
          <Field label="Quantidade">
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Menos" className="grid size-12 place-items-center rounded-xl bg-muted" onClick={() => setQtd(f.qtd - 1)}><Minus /></button>
              <span className="w-8 text-center font-display text-2xl">{f.qtd}</span>
              <button type="button" aria-label="Mais" className="grid size-12 place-items-center rounded-xl bg-muted" onClick={() => setQtd(f.qtd + 1)}><Plus /></button>
            </div>
          </Field>
          <Field label="Valor total (R$)"><input className={inputCls + " font-display text-xl"} inputMode="decimal" value={f.valor} onChange={(e) => set({ valor: e.target.value })} /></Field>
        </div>
        <Field label="Status"><div className="flex flex-wrap gap-2">{STATUSES.map((s) => <Chip key={s.id} active={f.status === s.id} onClick={() => set({ status: s.id })}>{s.id === "pendente" ? "Pendente" : s.label}</Chip>)}</div></Field>
        <Field label="Pagamento"><div className="flex flex-wrap gap-2">{PGTOS.map((p) => <Chip key={p} active={f.pgto === p} onClick={() => set({ pgto: f.pgto === p ? "" : p })}>{p}</Chip>)}</div></Field>
        <Field label="Entrega"><div className="flex flex-wrap gap-2">{ENTREGAS.map((p) => <Chip key={p} active={f.entrega === p} onClick={() => set({ entrega: f.entrega === p ? "" : p })}>{p}</Chip>)}</div></Field>
        <Field label="Data"><input type="date" className={inputCls} value={f.data} onChange={(e) => set({ data: e.target.value })} /></Field>
        <Field label="Observações"><textarea className={inputCls + " min-h-20 py-2"} value={f.obs} onChange={(e) => set({ obs: e.target.value })} /></Field>
        <Btn className="w-full text-base" onClick={save}>{order ? "Salvar alterações" : "Registrar pedido"}</Btn>

        {order && (
          <>
            {order.linhaOrigem && (
              <div className="rounded-2xl bg-muted p-4 text-sm">
                <p className="mb-2 font-semibold">Original da planilha (linha {order.linhaOrigem})</p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-muted-foreground">
                  <dt>Cliente</dt><dd>{order.clienteOriginal || "—"}</dd>
                  <dt>Status</dt><dd>{order.statusOriginal || "—"}</dd>
                  <dt>Data</dt><dd>{order.dataOriginal || "—"}</dd>
                  <dt>Valor</dt><dd>{order.valorOriginal || "—"}</dd>
                  <dt>Pgto</dt><dd>{order.pgtoOriginal || "—"}</dd>
                </dl>
              </div>
            )}
            {order.historico.length > 0 && (
              <div className="text-sm">
                <p className="mb-2 font-semibold">Histórico de alterações</p>
                <ul className="space-y-1 text-muted-foreground">
                  {order.historico.slice().reverse().map((h, i) => (
                    <li key={i}>{fmtDate(h.ts.slice(0, 10))} · <b>{h.campo}</b>: {h.de || "—"} → {h.para || "—"}</li>
                  ))}
                </ul>
              </div>
            )}
            {!order.excluido ? (
              confirmDel ? (
                <div className="flex gap-2">
                  <Btn variant="danger" className="flex-1" onClick={() => { updateOrder(order.id, { excluido: true }); toast("Pedido excluído (recuperável pelo backup)"); onClose(); }}>Confirmar exclusão</Btn>
                  <Btn variant="ghost" onClick={() => setConfirmDel(false)}>Cancelar</Btn>
                </div>
              ) : <Btn variant="ghost" className="w-full text-destructive" onClick={() => setConfirmDel(true)}>Excluir pedido</Btn>
            ) : <Btn variant="ghost" className="w-full" onClick={() => { updateOrder(order.id, { excluido: false }); onClose(); }}>Restaurar pedido</Btn>}
          </>
        )}
      </div>
    </Sheet>
  );
}

export function parseVal(s: string) {
  let t = s.replace(/R\$|\s/g, "");
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(t);
  return isNaN(n) ? 0 : Math.round(n * 100) / 100;
}
