import { useMemo, useRef, useState } from "react";
import { Instagram, MessageCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { useStore, validateBackup } from "@/lib/bia/store";
import { STATUSES, type Client, type Order, type Status } from "@/lib/bia/types";
import { clientKey, download, fmtBRL, fmtDate, fmtMonth, igLink, isActive, openFlags, toCSV, waLink } from "@/lib/bia/format";
import originalCsv from "@/data/original.csv?raw";
import { Btn, Chip, Empty, Field, inputCls, OrderCard, Sheet } from "./ui";

type Open = (o: Order) => void;
const H = ({ children, sub }: { children: string; sub?: string }) => (
  <div className="mb-4">
    <h1 className="font-display text-3xl">{children}</h1>
    {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
  </div>
);
const isOpen = (o: Order) => o.status === "pendente" || o.status === "pago";

/* ---------------- Pendências ---------------- */
export function Pendencias({ onOpen }: { onOpen: Open }) {
  const { data, updateOrder } = useStore();
  const act = data!.orders.filter(isActive);
  const has = (o: Order, s: string) => clientKey(o.obs).includes(s);
  const groups: { t: string; d: string; list: Order[] }[] = [
    { t: "Falta postar", d: "Pagos, ainda não enviados", list: act.filter((o) => o.status === "pago") },
    { t: "Falta cobrar", d: "Aguardando pagamento", list: act.filter((o) => o.status === "pendente" && o.valor > 0) },
    { t: "Entrega urgente", d: "", list: act.filter((o) => isOpen(o) && has(o, "urgente")) },
    { t: "Ligar", d: "", list: act.filter((o) => isOpen(o) && has(o, "ligar")) },
    { t: "Ver com Bia", d: "", list: act.filter((o) => isOpen(o) && has(o, "ver com bia")) },
  ];
  const [sel, setSel] = useState(0);
  const g = groups[sel]!;
  const total = g.list.reduce((s, o) => s + o.valor, 0);
  return (
    <div>
      <H sub="O que precisa da sua atenção hoje">Pendências</H>
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {groups.map((x, i) => <Chip key={x.t} active={i === sel} onClick={() => setSel(i)}>{x.t} · {x.list.length}</Chip>)}
      </div>
      <p className="mb-3 text-sm text-muted-foreground">{g.d}{g.d && " · "}Total {fmtBRL(total)}</p>
      <div className="space-y-3">
        {g.list.length === 0 && <Empty>Nada por aqui. 🎉</Empty>}
        {g.list.sort((a, b) => a.data.localeCompare(b.data)).map((o) => (
          <OrderCard key={o.id} o={o} onOpen={() => onOpen(o)} actions={
            <>
              {o.status === "pendente" && <Btn className="flex-1" onClick={() => { updateOrder(o.id, { status: "pago" }); toast.success("Marcado como pago"); }}>✓ Pago</Btn>}
              {o.status === "pago" && <Btn className="flex-1" onClick={() => { updateOrder(o.id, { status: "enviado" }); toast.success("Marcado como enviado"); }}>✓ Enviado</Btn>}
            </>
          } />
        ))}
      </div>
    </div>
  );
}

/* ---------------- Pedidos ---------------- */
export function Pedidos({ onOpen }: { onOpen: Open }) {
  const { data } = useStore();
  const [q, setQ] = useState("");
  const [st, setSt] = useState<Status | "todos">("todos");
  const act = data!.orders.filter(isActive);
  const k = clientKey(q);
  const matched = act.filter((o) => !k || [o.cliente, o.produto, o.obs, o.detalhe, fmtBRL(o.valor), String(o.valor)].some((s) => clientKey(s).includes(k)));
  const list = matched.filter((o) => st === "todos" || o.status === st).sort((a, b) => b.data.localeCompare(a.data));
  const stat = (s: Status | "todos") => { const l = matched.filter((o) => s === "todos" || o.status === s); return `${l.length} · ${fmtBRL(l.reduce((a, o) => a + o.valor, 0))}`; };
  return (
    <div>
      <H sub={`${act.length} pedidos ativos`}>Pedidos</H>
      <div className="relative mb-3">
        <Search className="absolute top-3.5 left-3 size-5 text-muted-foreground" />
        <input className={inputCls + " pl-10"} placeholder="Buscar cliente, produto, obs, valor…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <Chip active={st === "todos"} onClick={() => setSt("todos")}>Todos · {stat("todos")}</Chip>
        {STATUSES.map((s) => <Chip key={s.id} active={st === s.id} onClick={() => setSt(s.id)}>{s.id === "pendente" ? "Pendente" : s.label} · {stat(s.id)}</Chip>)}
      </div>
      <div className="space-y-3">
        {list.length === 0 && <Empty>Nenhum pedido encontrado.</Empty>}
        {list.map((o) => <OrderCard key={o.id} o={o} onOpen={() => onOpen(o)} />)}
      </div>
    </div>
  );
}

/* ---------------- Clientes ---------------- */
export function Clientes({ onOpen }: { onOpen: Open }) {
  const { data } = useStore();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Client | null>(null);
  const stats = useMemo(() => {
    const m = new Map<string, { n: number; total: number }>();
    for (const o of data!.orders.filter(isActive)) {
      const s = m.get(o.clienteKey) ?? { n: 0, total: 0 };
      s.n++; if (o.status === "pago" || o.status === "enviado") s.total += o.valor;
      m.set(o.clienteKey, s);
    }
    return m;
  }, [data]);
  const list = data!.clients.filter((c) => clientKey(c.nome + " " + c.instagram + " " + c.whatsapp).includes(clientKey(q))).sort((a, b) => a.nome.localeCompare(b.nome));
  return (
    <div>
      <H sub={`${data!.clients.length} clientes`}>Clientes</H>
      <input className={inputCls + " mb-4"} placeholder="Buscar cliente…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="space-y-3">
        {list.length === 0 && <Empty>Nenhum cliente encontrado.</Empty>}
        {list.map((c) => {
          const s = stats.get(c.key);
          return (
            <div key={c.key} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <button className="min-w-0 flex-1 text-left" onClick={() => setEdit(c)}>
                <p className="truncate font-semibold">{c.nome}</p>
                <p className="text-sm text-muted-foreground">{s?.n ?? 0} pedidos · {fmtBRL(s?.total ?? 0)}</p>
              </button>
              {c.whatsapp && <a aria-label="WhatsApp" href={waLink(c.whatsapp)} target="_blank" rel="noreferrer" className="grid size-11 place-items-center rounded-full bg-accent text-accent-foreground"><MessageCircle className="size-5" /></a>}
              {c.instagram && <a aria-label="Instagram" href={igLink(c.instagram)} target="_blank" rel="noreferrer" className="grid size-11 place-items-center rounded-full bg-secondary text-secondary-foreground"><Instagram className="size-5" /></a>}
            </div>
          );
        })}
      </div>
      {edit && <ClientSheet c={edit} onClose={() => setEdit(null)} onOpen={onOpen} />}
    </div>
  );
}

function ClientSheet({ c, onClose, onOpen }: { c: Client; onClose: () => void; onOpen: Open }) {
  const { data, saveClient } = useStore();
  const [f, setF] = useState({ ...c, enderecosTxt: c.enderecos.join("\n") });
  const orders = data!.orders.filter((o) => isActive(o) && o.clienteKey === c.key).sort((a, b) => b.data.localeCompare(a.data));
  const save = () => {
    saveClient(c.key, { ...f, nome: f.nome.trim(), enderecos: f.enderecosTxt.split("\n").map((s) => s.trim()).filter(Boolean) });
    toast.success("Cliente salvo"); onClose();
  };
  return (
    <Sheet open title={c.nome} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Nome"><input className={inputCls} value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} /></Field>
        <Field label="WhatsApp"><input className={inputCls} inputMode="tel" placeholder="(11) 99999-9999" value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} /></Field>
        <Field label="Instagram"><input className={inputCls} placeholder="@usuario" value={f.instagram} onChange={(e) => setF({ ...f, instagram: e.target.value })} /></Field>
        <Field label="Endereços (um por linha)"><textarea className={inputCls + " min-h-20 py-2"} value={f.enderecosTxt} onChange={(e) => setF({ ...f, enderecosTxt: e.target.value })} /></Field>
        <Field label="Notas"><textarea className={inputCls + " min-h-20 py-2"} value={f.notas} onChange={(e) => setF({ ...f, notas: e.target.value })} /></Field>
        {c.variantes.length > 1 && <p className="text-sm text-muted-foreground">Grafias na planilha: {c.variantes.join(", ")}</p>}
        <Btn className="w-full" onClick={save}>Salvar</Btn>
        <p className="font-semibold">Pedidos ({orders.length})</p>
        <div className="space-y-2">{orders.map((o) => <OrderCard key={o.id} o={o} onOpen={() => { onClose(); onOpen(o); }} />)}</div>
      </div>
    </Sheet>
  );
}

/* ---------------- Resumo ---------------- */
export function Resumo() {
  const { data } = useStore();
  const months = useMemo(() => {
    const m = new Map<string, { rec: number; n: number; aberto: number; prods: Map<string, number> }>();
    for (const o of data!.orders.filter(isActive)) {
      const ym = o.data.slice(0, 7);
      const s = m.get(ym) ?? { rec: 0, n: 0, aberto: 0, prods: new Map() };
      s.n++;
      if (o.status === "pago" || o.status === "enviado") { s.rec += o.valor; s.prods.set(o.produto, (s.prods.get(o.produto) ?? 0) + o.qtd); }
      if (o.status === "pendente") s.aberto += o.valor;
      m.set(ym, s);
    }
    return [...m.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [data]);
  const max = Math.max(1, ...months.map(([, s]) => s.rec));
  const total = months.reduce((a, [, s]) => a + s.rec, 0);
  return (
    <div>
      <H sub="Faturamento = pedidos pagos + enviados">Resumo</H>
      <div className="mb-4 rounded-2xl bg-primary p-5 text-primary-foreground">
        <p className="text-sm opacity-80">Faturamento total</p>
        <p className="font-display text-4xl">{fmtBRL(total)}</p>
      </div>
      <div className="space-y-3">
        {months.length === 0 && <Empty>Sem pedidos ainda.</Empty>}
        {months.map(([ym, s]) => (
          <div key={ym} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-xl capitalize">{fmtMonth(ym)}</p>
              <p className="font-display text-2xl">{fmtBRL(s.rec)}</p>
            </div>
            <div className="my-2 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${(s.rec / max) * 100}%` }} /></div>
            <p className="text-sm text-muted-foreground">{s.n} pedidos · em aberto {fmtBRL(s.aberto)}</p>
            <p className="mt-1 text-sm">Mais vendidos: {[...s.prods.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([p, q]) => `${p} (${q})`).join(", ") || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Revisão ---------------- */
export function Revisao({ onOpen }: { onOpen: Open }) {
  const { data, setOrderFlags, updateOrder, dismissDup } = useStore();
  const [tab, setTab] = useState<"flags" | "dups" | "arquivo">("dups");
  const [confirm, setConfirm] = useState<{ id: string; step: number } | null>(null);
  const flagged = data!.orders.filter((o) => isActive(o) && openFlags(o).length > 0);
  const archived = data!.orders.filter((o) => o.arquivado && !o.excluido);
  const dismissed = new Set(data!.meta.dupDismissed ?? []);
  const dups = useMemo(() => {
    const m = new Map<string, Order[]>();
    for (const o of data!.orders.filter(isActive)) {
      const k = [o.clienteKey, clientKey(o.produto), o.data].join("|");
      m.set(k, [...(m.get(k) ?? []), o]);
    }
    return [...m.entries()].filter(([k, l]) => l.length > 1 && !dismissed.has(k + "#" + l.map((o) => o.id).sort().join(",")));
  }, [data]);

  return (
    <div>
      <H sub="Nada é apagado automaticamente">Revisão</H>
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <Chip active={tab === "dups"} onClick={() => setTab("dups")}>Possíveis duplicados · {dups.length}</Chip>
        <Chip active={tab === "flags"} onClick={() => setTab("flags")}>Avisos · {flagged.length}</Chip>
        <Chip active={tab === "arquivo"} onClick={() => setTab("arquivo")}>Arquivados · {archived.length}</Chip>
      </div>

      {tab === "dups" && (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">Pedidos ativos com mesma cliente, produto e data. Duplicados idênticos da planilha já estão em “Arquivados”.</p>
          {dups.length === 0 && <Empty>Nenhum possível duplicado.</Empty>}
          {dups.map(([k, l]) => (
            <div key={k} className="space-y-2 rounded-2xl bg-muted p-3">
              {l.map((o) => (
                <OrderCard key={o.id} o={o} onOpen={() => onOpen(o)} actions={
                  <Btn variant="ghost" className="flex-1" onClick={() => { updateOrder(o.id, { arquivado: true, motivoArquivo: "duplicado (revisão manual)" }); toast("Arquivado — pode restaurar depois"); }}>Arquivar este</Btn>
                } />
              ))}
              <Btn variant="ghost" className="w-full" onClick={() => dismissDup(k + "#" + l.map((o) => o.id).sort().join(","))}>Não são duplicados</Btn>
            </div>
          ))}
        </div>
      )}

      {tab === "flags" && (
        <div className="space-y-3">
          {flagged.length === 0 && <Empty>Nenhum aviso pendente.</Empty>}
          {flagged.map((o) => (
            <div key={o.id}>
              <p className="mb-1 text-sm font-semibold text-destructive">{openFlags(o).join(" · ")}</p>
              <OrderCard o={o} onOpen={() => onOpen(o)} actions={
                <>
                  <Btn variant="ghost" className="flex-1" onClick={() => onOpen(o)}>Corrigir</Btn>
                  <Btn className="flex-1" onClick={() => setOrderFlags(o.id, { flagsResolvidas: [...(o.flagsResolvidas ?? []), ...openFlags(o)] })}>Está ok</Btn>
                </>
              } />
            </div>
          ))}
        </div>
      )}

      {tab === "arquivo" && (
        <div className="space-y-3">
          {archived.length === 0 && <Empty>Nenhum pedido arquivado.</Empty>}
          {archived.map((o) => (
            <div key={o.id}>
              <p className="mb-1 text-sm text-muted-foreground">{o.motivoArquivo}</p>
              <OrderCard o={o} onOpen={() => onOpen(o)} actions={
                confirm?.id === o.id ? (
                  <Btn variant="danger" className="flex-1" onClick={() => {
                    if (confirm.step === 1) return setConfirm({ id: o.id, step: 2 });
                    updateOrder(o.id, { excluido: true }); setConfirm(null); toast("Excluído definitivamente da lista");
                  }}>{confirm.step === 1 ? "Tem certeza?" : "Sim, excluir de vez"}</Btn>
                ) : (
                  <>
                    <Btn className="flex-1" onClick={() => { updateOrder(o.id, { arquivado: false }); toast.success("Restaurado"); }}>Restaurar</Btn>
                    <Btn variant="ghost" className="flex-1 text-destructive" onClick={() => setConfirm({ id: o.id, step: 1 })}>Excluir</Btn>
                  </>
                )
              } />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Backup ---------------- */
export function Backup() {
  const { data, replaceAll, markBackup } = useStore();
  const file = useRef<HTMLInputElement>(null);
  const d = data!;
  const stamp = new Date().toISOString().slice(0, 10);
  const counts = { ativos: d.orders.filter(isActive).length, arq: d.orders.filter((o) => o.arquivado && !o.excluido).length, exc: d.orders.filter((o) => o.excluido).length };
  const restore = async (f: File) => {
    try {
      const j = JSON.parse(await f.text());
      if (!validateBackup(j)) throw new Error();
      if (!confirm(`Substituir os dados atuais por este backup (${j.orders.length} pedidos)?`)) return;
      replaceAll(j); toast.success("Backup restaurado");
    } catch { toast.error("Arquivo inválido — não é um backup da Loja da Bia"); }
  };
  return (
    <div className="space-y-4">
      <H sub={`Último backup: ${fmtDate(d.meta.lastBackupAt.slice(0, 10))} · ${d.meta.changesSinceBackup} alterações desde então`}>Backup & dados</H>
      <div className="rounded-2xl border border-border bg-card p-4 text-sm">
        <p>{counts.ativos} ativos · {counts.arq} arquivados · {counts.exc} excluídos</p>
        <p className="text-muted-foreground">Total: {d.orders.length} pedidos ({d.meta.importTotal} vieram da planilha)</p>
      </div>
      <Btn className="w-full" onClick={() => { download(`loja-da-bia-backup-${stamp}.json`, JSON.stringify(d), "application/json"); markBackup(); toast.success("Backup salvo"); }}>Baixar backup completo (JSON)</Btn>
      <Btn variant="ghost" className="w-full" onClick={() => file.current?.click()}>Restaurar de um arquivo</Btn>
      <input ref={file} type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files?.[0] && restore(e.target.files[0])} />
      <Btn variant="ghost" className="w-full" onClick={() => download(`pedidos-${stamp}.csv`, toCSV(d.orders.filter(isActive)), "text/csv")}>Exportar CSV para Planilhas</Btn>
      <Btn variant="ghost" className="w-full" onClick={() => download("planilha-original-pedidos.csv", originalCsv, "text/csv")}>Baixar planilha original</Btn>
    </div>
  );
}

/* ---------------- Sobre ---------------- */
export function Sobre() {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <H>Sobre o app</H>
      <section className="rounded-2xl border border-border bg-card p-4">
        <p className="mb-1 font-semibold">Instalar no celular</p>
        <p><b>iPhone:</b> abra no Safari → Compartilhar → “Adicionar à Tela de Início”.</p>
        <p><b>Android:</b> no Chrome → menu ⋮ → “Instalar app” ou “Adicionar à tela inicial”.</p>
      </section>
      <section className="rounded-2xl border border-border bg-card p-4">
        <p className="mb-1 font-semibold">Onde ficam seus dados</p>
        <p>Tudo fica só neste aparelho e funciona sem internet. Limpar os dados do navegador ou desinstalar o app apaga tudo — por isso faça backup toda semana (o app te lembra).</p>
      </section>
      <section className="rounded-2xl border border-border bg-card p-4">
        <p className="mb-1 font-semibold">O que foi arrumado da planilha</p>
        <p>193 pedidos importados: 22 grafias de status viraram 5, datas em 6 formatos padronizadas, valores com vírgula/ponto corrigidos, nomes unificados, 8 duplicados idênticos e 1 linha de teste arquivados (restauráveis). Os valores originais de cada linha continuam guardados.</p>
      </section>
    </div>
  );
}
