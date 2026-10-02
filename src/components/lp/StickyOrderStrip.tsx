import { LpChip } from "./LpChip";
import type { LpStatus } from "@/types/LpStatus";

export function StickyOrderStrip({ status }: { status: LpStatus }) {
  return (
    <div className="sticky top-0 z-30 border-b glass-bar px-4 py-2.5 md:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Pedido da Maria · 2× canga</p>
          <p className="text-xs text-muted-foreground">acompanhe a vida dele abaixo</p>
        </div>
        <LpChip status={status} />
      </div>
    </div>
  );
}
