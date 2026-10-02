import { Link } from "@tanstack/react-router";
import { MiniOrderCard } from "./MiniOrderCard";
import { StatusTrack } from "./StatusTrack";
import { CTA_CLASS } from "./cta-class";
import type { LpStatus } from "@/types/LpStatus";

export function OrderConsole({ status, track }: { status: LpStatus; track: number }) {
  return (
    <div className="rounded-2xl border glass-panel p-5">
      <p className="text-lg font-semibold tracking-tight">O pedido da Maria</p>
      <div className="mt-3">
        <MiniOrderCard status={status} />
      </div>
      <div className="mt-4">
        <StatusTrack active={track} />
      </div>
      <Link to="/" className={`${CTA_CLASS} mt-5 w-full`}>
        Abrir o app
      </Link>
    </div>
  );
}
