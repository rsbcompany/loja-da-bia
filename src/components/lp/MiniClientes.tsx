import { Instagram, MessageCircle } from "lucide-react";
import { MiniAppScreen } from "./MiniAppScreen";

export function MiniClientes() {
  return (
    <MiniAppScreen title="Clientes" sub="1 cliente">
      <div className="flex items-center gap-3 rounded-lg border glass-card p-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">Maria</p>
          <p className="text-[11px] text-muted-foreground">1 pedido · R$ 90,00</p>
        </div>
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground"
        >
          <MessageCircle className="size-4" />
        </span>
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground"
        >
          <Instagram className="size-4" />
        </span>
      </div>
    </MiniAppScreen>
  );
}
