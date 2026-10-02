import { fmtBRL } from "@/lib/bia/format";
import { DEMO_ORDER } from "./lp-content";
import { MiniAppScreen } from "./MiniAppScreen";

export function MiniResumo() {
  return (
    <MiniAppScreen title="Resumo" sub="Faturamento = pedidos pagos + enviados">
      <div className="mb-2 rounded-lg border glass-card p-3">
        <p className="text-[10px] font-medium tracking-wide uppercase text-muted-foreground">
          out/2026
        </p>
        <p className="mt-0.5 text-2xl font-semibold tracking-tight tabular-nums">
          {fmtBRL(DEMO_ORDER.valor)}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          1 pedido · desde o início {fmtBRL(DEMO_ORDER.valor)}
        </p>
      </div>
      <div className="rounded-lg border glass-card p-3">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-semibold capitalize">out/2026</p>
          <p className="text-base font-semibold tabular-nums">{fmtBRL(DEMO_ORDER.valor)}</p>
        </div>
        <div aria-hidden className="my-2 h-2 rounded-full glass-control">
          <div className="h-2 rounded-full bg-primary" />
        </div>
        <p className="text-[11px] text-muted-foreground">1 pedido · em aberto {fmtBRL(0)}</p>
        <p className="mt-1 text-[11px]">Mais vendidos: canga (2)</p>
      </div>
    </MiniAppScreen>
  );
}
