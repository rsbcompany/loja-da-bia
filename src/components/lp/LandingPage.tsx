import { useMemo } from "react";
import { useActiveStep } from "@/hooks/use-active-step";
import { ClosingCta } from "./ClosingCta";
import { DemoPanel } from "./DemoPanel";
import { FutureStrip } from "./FutureStrip";
import { MiniClientes } from "./MiniClientes";
import { MiniPendencias } from "./MiniPendencias";
import { MiniPedidos } from "./MiniPedidos";
import { MiniResumo } from "./MiniResumo";
import { OrderConsole } from "./OrderConsole";
import { OrderHero } from "./OrderHero";
import { StickyOrderStrip } from "./StickyOrderStrip";
import { StepSection } from "./StepSection";
import { TrustNotes } from "./TrustNotes";
import { LP_STEPS } from "./lp-content";
import type { LpStep } from "@/types/LpStep";
import type { ReactNode } from "react";

function buildStepScreen(step: LpStep): ReactNode {
  if (step.screen === "pendencias") return <MiniPendencias status={step.status} />;
  if (step.screen === "pedidos") return <MiniPedidos status={step.status} />;
  if (step.screen === "clientes") return <MiniClientes />;
  return <MiniResumo />;
}

export function LandingPage() {
  const activeStep = useActiveStep();
  const step = useMemo(() => LP_STEPS[Math.min(activeStep, LP_STEPS.length - 1)]!, [activeStep]);
  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 md:px-6">
      <StickyOrderStrip status={step.status} />
      <OrderHero />
      <DemoPanel status={step.status} track={step.track} className="md:hidden" />
      <div className="md:grid md:grid-cols-[340px_1fr] md:gap-12">
        <aside className="sticky top-10 hidden self-start md:block">
          <OrderConsole status={step.status} track={step.track} />
        </aside>
        <main>
          {LP_STEPS.map((lpStep, index) => (
            <StepSection key={lpStep.id} step={lpStep} flip={index % 2 === 1}>
              {buildStepScreen(lpStep)}
            </StepSection>
          ))}
          <TrustNotes />
          <FutureStrip />
          <ClosingCta />
        </main>
      </div>
    </div>
  );
}
