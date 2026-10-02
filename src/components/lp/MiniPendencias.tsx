import { MiniAppScreen } from "./MiniAppScreen";
import { MiniChip } from "./MiniChip";
import { MiniOrderCard } from "./MiniOrderCard";
import type { LpStatus } from "@/types/LpStatus";

const ACTION_PRIMARY =
  "flex min-h-9 flex-1 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground";
const ACTION_GHOST =
  "flex min-h-9 flex-1 items-center justify-center rounded-md border glass-card text-xs font-semibold text-foreground";

export function MiniPendencias({ status }: { status: LpStatus }) {
  const charging = status === "pendente";
  return (
    <MiniAppScreen title="Pendências" sub="O que precisa da sua atenção hoje">
      <div className="mb-2 flex gap-1.5">
        <MiniChip label={`Falta postar · ${charging ? 0 : 1}`} active={!charging} />
        <MiniChip label={`Falta cobrar · ${charging ? 1 : 0}`} active={charging} />
      </div>
      <p className="mb-2 text-[11px] text-muted-foreground">
        {charging ? "Aguardando pagamento" : "Pagos, ainda não enviados"} · Total R$ 90,00
      </p>
      <div className="space-y-2">
        <MiniOrderCard status={status} />
        <div aria-hidden className="flex flex-col gap-2">
          {charging ? (
            <>
              <span className={ACTION_PRIMARY}>Cobrar no WhatsApp</span>
              <span className={ACTION_GHOST}>✓ Pago</span>
            </>
          ) : (
            <span className={ACTION_PRIMARY}>✓ Enviado</span>
          )}
        </div>
      </div>
    </MiniAppScreen>
  );
}
