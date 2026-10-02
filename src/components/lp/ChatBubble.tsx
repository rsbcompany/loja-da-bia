import { DEMO_MESSAGE } from "./lp-content";

export function ChatBubble() {
  return (
    <div className="mx-auto max-w-[300px]">
      <div className="rounded-lg rounded-bl-sm border glass-card px-4 py-3 text-sm leading-snug">
        “{DEMO_MESSAGE}”
      </div>
      <p className="mt-1 text-right text-[11px] text-muted-foreground">
        mensagem no Direct (exemplo)
      </p>
    </div>
  );
}
