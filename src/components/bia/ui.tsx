import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order, Status } from "@/lib/bia/types";
import { STATUSES } from "@/lib/bia/types";
import { fmtBRL, fmtDate, openFlags } from "@/lib/bia/format";

export function Chip({ active, onClick, children, className }: { active?: boolean; onClick?: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

const STATUS_STYLE: Record<Status, string> = {
  pendente: "bg-warning text-warning-foreground",
  pago: "bg-accent text-accent-foreground",
  enviado: "bg-secondary text-secondary-foreground",
  cancelado: "bg-muted text-muted-foreground line-through",
  devolvido: "bg-muted text-muted-foreground",
};
export const statusLabel = (s: Status) => STATUSES.find((x) => x.id === s)?.label ?? s;
export function StatusBadge({ s }: { s: Status }) {
  return <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", STATUS_STYLE[s])}>{s === "pendente" ? "Pendente" : statusLabel(s)}</span>;
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-background p-5 pb-10" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl">{title}</h2>
          <button aria-label="Fechar" onClick={onClose} className="grid size-10 place-items-center rounded-full bg-muted"><X className="size-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{children}</p>;
}

export function OrderCard({ o, onOpen, actions }: { o: Order; onOpen: () => void; actions?: ReactNode }) {
  const flags = openFlags(o);
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <button className="w-full text-left" onClick={onOpen}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold">{o.cliente}</p>
            <p className="truncate text-sm text-muted-foreground">
              {o.qtd}× {o.produto}{o.detalhe ? ` · ${o.detalhe}` : ""}
            </p>
          </div>
          <p className="font-display text-xl whitespace-nowrap">{fmtBRL(o.valor)}</p>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <StatusBadge s={o.status} />
          <span>{fmtDate(o.data)}</span>
          {o.pgto && <span>· {o.pgto}</span>}
          {o.entrega && <span>· {o.entrega}</span>}
          {flags.length > 0 && <span className="rounded-full bg-destructive/15 px-2 py-0.5 font-semibold text-destructive">revisar</span>}
        </div>
        {o.obs && <p className="mt-2 text-sm italic text-muted-foreground">“{o.obs}”</p>}
      </button>
      {actions && <div className="mt-3 flex gap-2">{actions}</div>}
    </div>
  );
}

export function Btn({ children, onClick, variant = "primary", className, type = "button" }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "danger"; className?: string; type?: "button" | "submit" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-xl px-4 text-sm font-semibold",
        variant === "primary" && "bg-primary text-primary-foreground",
        variant === "ghost" && "border border-border bg-card",
        variant === "danger" && "bg-destructive text-destructive-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

export const inputCls = "w-full min-h-12 rounded-xl border border-input bg-card px-3 text-base outline-none focus:border-ring";
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
