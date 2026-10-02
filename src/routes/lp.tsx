import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/lp/LandingPage";

export const Route = createFileRoute("/lp")({
  head: () => ({
    meta: [
      { title: "Como funciona o app — Loja da Bia" },
      {
        name: "description",
        content:
          "Veja a vida de um pedido no app da Loja da Bia: chega no Direct, você registra, confirma o pagamento e entrega — sem perder nenhum.",
      },
      { property: "og:title", content: "Como funciona o app — Loja da Bia" },
      { property: "og:description", content: "A vida de um pedido dentro do app da Loja da Bia." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: LandingPage,
});
