import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, ClipboardList, Menu, Plus, ShoppingBag, Users } from "lucide-react";
import { StoreProvider, useStore } from "@/lib/bia/store";
import type { Order } from "@/lib/bia/types";
import { OrderEditor } from "@/components/bia/OrderEditor";
import { Backup, Clientes, Pedidos, Pendencias, Resumo, Revisao, Sobre } from "@/components/bia/screens";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Loja da Bia" },
      { name: "description", content: "Gerenciador de pedidos da Loja da Bia: pendências, clientes, resumo mensal e backup, tudo no celular." },
      { property: "og:title", content: "Loja da Bia" },
      { property: "og:description", content: "Gerenciador de pedidos local e offline da Loja da Bia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <StoreProvider>
      <App />
    </StoreProvider>
  ),
});

type Tab = "pend" | "pedidos" | "clientes" | "resumo" | "mais";
type Mais = "revisao" | "backup" | "sobre";

function App() {
  const { data } = useStore();
  const [tab, setTab] = useState<Tab>("pend");
  const [mais, setMais] = useState<Mais>("revisao");
  const [editing, setEditing] = useState<{ o?: Order | undefined } | null>(null);
  if (!data) return <div className="grid min-h-screen place-items-center font-display text-2xl">Loja da Bia…</div>;
  const open = (o: Order) => setEditing({ o: data.orders.find((x) => x.id === o.id) });
  const days = (Date.now() - new Date(data.meta.lastBackupAt).getTime()) / 864e5;
  const remind = data.meta.changesSinceBackup >= 30 || days >= 7;

  const nav: { id: Tab; label: string; Icon: typeof Plus }[] = [
    { id: "pend", label: "Pendências", Icon: ClipboardList },
    { id: "pedidos", label: "Pedidos", Icon: ShoppingBag },
    { id: "clientes", label: "Clientes", Icon: Users },
    { id: "resumo", label: "Resumo", Icon: BarChart3 },
    { id: "mais", label: "Mais", Icon: Menu },
  ];
  return (
    <div className="mx-auto min-h-screen max-w-lg pb-28">
      {remind && (
        <button onClick={() => { setTab("mais"); setMais("backup"); }} className="w-full bg-warning px-4 py-3 text-left text-sm font-medium text-warning-foreground">
          Hora de fazer backup ({data.meta.changesSinceBackup} alterações). Toque aqui.
        </button>
      )}
      <main className="px-4 pt-6">
        {tab === "pend" && <Pendencias onOpen={open} />}
        {tab === "pedidos" && <Pedidos onOpen={open} />}
        {tab === "clientes" && <Clientes onOpen={open} />}
        {tab === "resumo" && <Resumo />}
        {tab === "mais" && (
          <>
            <div className="mb-4 flex gap-2">
              {(["revisao", "backup", "sobre"] as Mais[]).map((m) => (
                <button key={m} onClick={() => setMais(m)} className={cn("min-h-10 flex-1 rounded-xl text-sm font-semibold", mais === m ? "bg-foreground text-background" : "bg-muted")}>
                  {{ revisao: "Revisão", backup: "Backup", sobre: "Sobre" }[m]}
                </button>
              ))}
            </div>
            {mais === "revisao" && <Revisao onOpen={open} />}
            {mais === "backup" && <Backup />}
            {mais === "sobre" && <Sobre />}
          </>
        )}
      </main>
      <button aria-label="Novo pedido" onClick={() => setEditing({})} className="fixed right-5 bottom-24 z-40 grid size-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg">
        <Plus className="size-8" />
      </button>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card">
        <div className="mx-auto flex max-w-lg">
          {nav.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)} className={cn("flex flex-1 flex-col items-center gap-1 py-3 text-xs", tab === id ? "text-primary" : "text-muted-foreground")}>
              <Icon className="size-6" />
              {label}
            </button>
          ))}
        </div>
      </nav>
      <OrderEditor open={!!editing} order={editing?.o} onClose={() => setEditing(null)} />
    </div>
  );
}
