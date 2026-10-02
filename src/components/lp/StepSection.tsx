import type { ReactNode } from "react";
import { PhoneFrame } from "./PhoneFrame";
import { cn } from "@/lib/utils";
import type { LpStep } from "@/types/LpStep";

export function StepSection({
  step,
  flip,
  children,
}: {
  step: LpStep;
  flip: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={`lp-step-${step.id}`}
      data-lp-step
      className="grid items-center gap-8 py-10 md:grid-cols-[1fr_280px] md:gap-12"
    >
      <div className={cn(flip && "md:order-2")}>
        <h2 className="text-2xl leading-snug font-semibold tracking-tight">{step.title}</h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">{step.copy}</p>
      </div>
      <PhoneFrame label={`no app: ${step.tab} — exemplo`} className={cn(flip && "md:order-1")}>
        {children}
      </PhoneFrame>
    </section>
  );
}
