import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

async function renderAt(path: string) {
  const queryClient = new QueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await router.load();
  return render(<RouterProvider router={router} />);
}

afterEach(() => {
  cleanup();
});

describe("LP route", () => {
  it("renders the headline and the open-app CTA", async () => {
    renderAt("/lp");

    expect(await screen.findByRole("heading", { name: /Do Direct à entrega/ })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Abrir o app" }).length).toBeGreaterThanOrEqual(2);
  });

  it("renders the five order steps", async () => {
    renderAt("/lp");

    expect(await screen.findByText("A cobrança sai com um toque")).toBeInTheDocument();
    expect(screen.getByText("O mês fecha sozinho")).toBeInTheDocument();
    expect(screen.getAllByRole("list", { name: "Etapas do pedido" }).length).toBe(2);
  });
});
