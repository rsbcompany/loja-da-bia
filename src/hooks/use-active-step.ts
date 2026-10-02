import { useEffect, useState } from "react";
import type { StepSetter } from "@/types/StepSetter";

const stepEls = () => Array.from(document.querySelectorAll<HTMLElement>("[data-lp-step]"));

const distanceToCenter = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  return Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2);
};

const pickActiveStep = (els: HTMLElement[]) => {
  const distances = els.map(distanceToCenter);
  return distances.indexOf(Math.min(...distances));
};

const scheduleCheck = (onStep: StepSetter) => {
  const check = () => onStep(pickActiveStep(stepEls()));
  if (typeof requestAnimationFrame !== "function") return check;
  let raf = 0;
  return () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(check);
  };
};

const subscribeStepScroll = (onStep: StepSetter) => {
  if (typeof window === "undefined") return () => undefined;
  const check = scheduleCheck(onStep);
  check();
  window.addEventListener("scroll", check, { passive: true });
  return () => {
    window.removeEventListener("scroll", check);
  };
};

export function useActiveStep() {
  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => subscribeStepScroll(setActiveStep), []);
  return activeStep;
}
