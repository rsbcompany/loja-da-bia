import type { ReactNode } from "react";

export function MiniAppScreen({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: ReactNode;
}) {
  return (
    <div className="px-3.5 pt-2.5 pb-4">
      <div className="mb-3">
        <p className="text-xl font-semibold tracking-tight">{title}</p>
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      </div>
      {children}
    </div>
  );
}
