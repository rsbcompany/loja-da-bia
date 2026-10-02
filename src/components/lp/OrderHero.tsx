import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { CTA_CLASS } from "./cta-class";

export function OrderHero() {
  return (
    <header className="pt-10 pb-8 md:pt-16">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
        <ShoppingBag aria-hidden className="size-4" />
        Loja da Bia
      </p>
      <h1 className="mt-3 max-w-xl text-4xl leading-[1.15] font-semibold tracking-tight md:text-6xl md:leading-[1.08]">
        Do Direct à entrega, sem perder nenhum pedido.
      </h1>
      <p className="mt-4 max-w-md text-base text-muted-foreground">
        Esse é o app que cuida dos seus pedidos. Role e veja a vida de um pedido dentro dele — do
        primeiro “oi” ao dinheiro no bolso.
      </p>
      <div className="mt-6">
        <Link to="/" className={CTA_CLASS}>
          Abrir o app
        </Link>
        <p className="mt-2 text-xs text-muted-foreground">
          Dá para instalar na tela do celular, como um app de verdade.
        </p>
      </div>
    </header>
  );
}
