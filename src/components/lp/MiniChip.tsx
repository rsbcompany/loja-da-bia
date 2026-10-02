import { cn } from "@/lib/utils";

export function MiniChip({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        active ? "border-foreground bg-foreground text-background" : "glass-card text-foreground",
      )}
    >
      {label}
    </span>
  );
}
