import { Link } from "@tanstack/react-router";

export function ClosingCta() {
  return (
    <section className="rounded-2xl border glass-panel px-6 py-12 text-center">
      <h2 className="text-3xl leading-tight font-semibold tracking-tight">
        Pronta para ver de perto?
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
        Tudo fica no seu celular — funciona até sem internet.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Abrir o app
      </Link>
    </section>
  );
}
