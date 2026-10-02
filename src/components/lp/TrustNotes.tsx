import { LP_TRUST_NOTES } from "./lp-content";

export function TrustNotes() {
  return (
    <section className="my-6 rounded-lg border glass-panel px-6 py-8">
      <h2 className="text-2xl font-semibold tracking-tight">E o que dá errado?</h2>
      <ul className="mt-5 space-y-4">
        {LP_TRUST_NOTES.map(({ Icon, text }) => (
          <li key={text} className="flex items-start gap-3 text-sm">
            <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
            <span className="text-muted-foreground">{text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
