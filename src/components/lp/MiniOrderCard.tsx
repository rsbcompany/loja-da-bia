import { fmtBRL, fmtDate } from "@/lib/bia/format";
import { DEMO_ORDER } from "./lp-content";
import { LpChip } from "./LpChip";
import type { LpStatus } from "@/types/LpStatus";

export function MiniOrderCard({ status }: { status: LpStatus }) {
  const showTracking = status === "enviado" || status === "entregue";
  return (
    <div className="rounded-lg border glass-card p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold">{DEMO_ORDER.cliente}</p>
          <p className="truncate text-sm text-muted-foreground">
            {DEMO_ORDER.qtd}× {DEMO_ORDER.produto}
          </p>
        </div>
        <p className="text-lg font-semibold tabular-nums whitespace-nowrap">
          {fmtBRL(DEMO_ORDER.valor)}
        </p>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <LpChip status={status} />
        <span>{fmtDate(DEMO_ORDER.data)}</span>
        <span>· {DEMO_ORDER.pgto}</span>
        {showTracking && <span className="tabular-nums">· {DEMO_ORDER.rastreio}</span>}
      </div>
    </div>
  );
}
