import { cn } from "@/lib/utils";
import type { TrackState } from "@/types/TrackState";

const NODES = ["Chegou", "Pago", "Enviado", "Entregue"];

const nodeCls = (state: TrackState) =>
  cn(
    "size-3 rounded-full border-2 transition-colors",
    state === "todo" ? "border-border bg-background" : "border-primary bg-primary",
    state === "current" && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
  );

export function StatusTrack({ active }: { active: number }) {
  return (
    <ol className="flex items-start" aria-label="Etapas do pedido">
      {NODES.map((label, index) => (
        <TrackNode
          key={label}
          label={label}
          state={index < active ? "done" : index === active ? "current" : "todo"}
          isLast={index === NODES.length - 1}
        />
      ))}
    </ol>
  );
}

function TrackNode({
  label,
  state,
  isLast,
}: {
  label: string;
  state: TrackState;
  isLast: boolean;
}) {
  return (
    <li className={cn("flex items-start", !isLast && "flex-1")}>
      <div className="flex w-14 shrink-0 flex-col items-center gap-1">
        <span className={nodeCls(state)} />
        <span
          className={cn(
            "text-[10px] leading-none font-medium",
            state === "todo" ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {label}
        </span>
      </div>
      {!isLast && (
        <span
          aria-hidden
          className={cn(
            "mt-[5px] h-0.5 flex-1 transition-colors",
            state === "todo" ? "bg-border" : "bg-primary",
          )}
        />
      )}
    </li>
  );
}
