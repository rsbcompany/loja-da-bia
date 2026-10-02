import { LP_FUTURES } from "./lp-content";

export function FutureStrip() {
  return (
    <section className="py-10">
      <h2 className="text-3xl leading-tight font-semibold tracking-tight">
        O mesmo pedido, depois de amanhã
      </h2>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        O app está em construção. O que vem nas próximas fases do roadmap:
      </p>
      <ol className="mt-6 space-y-3">
        {LP_FUTURES.map((future) => (
          <FutureRow key={future.id} future={future} />
        ))}
      </ol>
    </section>
  );
}

function FutureRow({ future }: { future: (typeof LP_FUTURES)[number] }) {
  return (
    <li className="flex items-start gap-3 rounded-lg border border-dashed glass-card p-4">
      <span className="mt-0.5 shrink-0 rounded-full glass-control px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
        Fase {future.phase} · previsto
      </span>
      <div>
        <p className="font-semibold">{future.title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{future.copy}</p>
      </div>
    </li>
  );
}
