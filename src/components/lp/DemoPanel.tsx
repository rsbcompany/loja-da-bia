import { ArrowDown } from "lucide-react";
import { ChatBubble } from "./ChatBubble";
import { MiniOrderCard } from "./MiniOrderCard";
import { StatusTrack } from "./StatusTrack";
import { cn } from "@/lib/utils";
import type { LpStatus } from "@/types/LpStatus";

export function DemoPanel({
  status,
  track,
  className,
}: {
  status: LpStatus;
  track: number;
  className?: string;
}) {
  return (
    <section aria-label="Exemplo de pedido no app" className={cn("py-2", className)}>
      <ChatBubble />
      <ArrowDown aria-hidden className="mx-auto my-2 size-5 text-muted-foreground" />
      <div className="mx-auto max-w-[320px]">
        <MiniOrderCard status={status} />
      </div>
      <div className="mx-auto mt-4 max-w-[320px]">
        <StatusTrack active={track} />
      </div>
    </section>
  );
}
