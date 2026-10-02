import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PhoneFrame({
  children,
  label,
  className,
}: {
  children: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <figure className={cn("mx-auto w-full max-w-[280px]", className)}>
      <div className="rounded-[2rem] bg-foreground p-1 shadow-lg shadow-foreground/10">
        <div className="overflow-hidden rounded-[1.65rem] bg-background">
          <div aria-hidden className="mx-auto mt-2 h-1 w-14 rounded-full bg-foreground/20" />
          {children}
        </div>
      </div>
      <figcaption className="mt-2 text-center text-xs text-muted-foreground">{label}</figcaption>
    </figure>
  );
}
