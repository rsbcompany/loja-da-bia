import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order, Status } from "@/lib/bia/types";
import { STATUSES } from "@/lib/bia/types";
import { fmtBRL, fmtDate, openFlags } from "@/lib/bia/format";

export function Chip({
  active,
  onClick,
  children,
  className,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "min-h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors",
        active ? "border-foreground bg-foreground text-background" : "glass-card text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ChipRow({ children }: { children: ReactNode }) {
  return (
    <div className="relative -mx-4 mb-4">
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1 [mask-image:linear-gradient(to_right,black_calc(100%-3rem),transparent)]">
        {children}
      </div>
    </div>
  );
}

const STATUS_STYLE: Record<Status, string> = {
  pendente: "bg-warning text-warning-foreground",
  pago: "bg-accent text-accent-foreground",
  enviado: "bg-secondary text-secondary-foreground",
  cancelado: "glass-control text-muted-foreground line-through",
  devolvido: "glass-control text-muted-foreground",
};
export const statusLabel = (s: Status) => STATUSES.find((x) => x.id === s)?.label ?? s;
export function StatusBadge({ s }: { s: Status }) {
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", STATUS_STYLE[s])}>
      {s === "pendente" ? "Pendente" : statusLabel(s)}
    </span>
  );
}

export function Sheet({
  open,
  onClose,
  title,
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={onClose}>
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl glass-panel focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between px-4 pb-3 pt-5">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            aria-label="Fechar"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full glass-control"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className={cn("min-h-0 flex-1 overflow-y-auto px-4", footer ? "pb-5" : "pb-10")}>
          {children}
        </div>
        {footer && (
          <div className="shrink-0 border-t glass-control px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

export function OrderCard({
  o,
  onOpen,
  actions,
}: {
  o: Order;
  onOpen: () => void;
  actions?: ReactNode;
}) {
  const flags = openFlags(o);
  return (
    <div className="rounded-lg border glass-card p-3.5">
      <button className="w-full text-left" onClick={onOpen}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold">{o.cliente}</p>
            <p className="truncate text-sm text-muted-foreground">
              {o.qtd}× {o.produto}
              {o.detalhe ? ` · ${o.detalhe}` : ""}
            </p>
          </div>
          <p className="text-lg font-semibold tabular-nums whitespace-nowrap">{fmtBRL(o.valor)}</p>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <StatusBadge s={o.status} />
          <span>{fmtDate(o.data)}</span>
          {o.pgto && <span>· {o.pgto}</span>}
          {o.entrega && <span>· {o.entrega}</span>}
          {o.rastreio && <span className="tabular-nums">· {o.rastreio}</span>}
          {flags.length > 0 && (
            <span className="rounded-full bg-destructive/15 px-2 py-0.5 font-semibold text-destructive">
              revisar
            </span>
          )}
        </div>
        {o.obs && <p className="mt-2 text-sm italic text-muted-foreground">“{o.obs}”</p>}
      </button>
      {actions && <div className="mt-3 flex gap-2">{actions}</div>}
    </div>
  );
}

export function Btn({
  children,
  onClick,
  variant = "primary",
  className,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-md px-4 text-sm font-semibold",
        variant === "primary" && "bg-primary text-primary-foreground",
        variant === "ghost" && "border glass-card",
        variant === "danger" && "bg-destructive text-destructive-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

export const inputCls =
  "w-full min-h-12 rounded-md border border-input glass-card px-3 text-base outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";
export function Field({
  label,
  id,
  children,
}: {
  label: string;
  id?: string;
  children: ReactNode;
}) {
  if (id) {
    return (
      <div>
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-muted-foreground">
          {label}
        </label>
        {children}
      </div>
    );
  }
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
