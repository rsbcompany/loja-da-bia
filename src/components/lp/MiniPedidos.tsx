import { Search } from "lucide-react";
import { MiniAppScreen } from "./MiniAppScreen";
import { MiniChip } from "./MiniChip";
import { MiniOrderCard } from "./MiniOrderCard";
import type { LpStatus } from "@/types/LpStatus";

export function MiniPedidos({ status }: { status: LpStatus }) {
  return (
    <MiniAppScreen title="Pedidos" sub="1 pedido ativo">
      <div className="mb-2 flex items-center gap-2 rounded-md border border-input glass-input px-2.5 py-2 text-[11px] text-muted-foreground">
        <Search aria-hidden className="size-3.5" />
        Buscar cliente, produto, obs, valor…
      </div>
      <div className="mb-2 flex gap-1.5">
        <MiniChip label="Todos · 1" active={false} />
        <MiniChip label="Enviado · 1" active={status === "enviado"} />
      </div>
      <MiniOrderCard status={status} />
    </MiniAppScreen>
  );
}
