import { cn } from "@/lib/utils";
import { CHIP_LABELS, CHIP_STYLE } from "./lp-content";
import type { LpStatus } from "@/types/LpStatus";

export function LpChip({ status }: { status: LpStatus }) {
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", CHIP_STYLE[status])}>
      {CHIP_LABELS[status]}
    </span>
  );
}
