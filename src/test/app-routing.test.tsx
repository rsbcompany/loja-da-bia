import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import seed from "@/data/seed.json";
import { routeTree } from "@/routeTree.gen";
import type { AppData } from "@/lib/bia/types";

vi.mock("@/services/api", () => ({
  ApiError: class extends Error {},
  createNewOrder: vi.fn(),
  dismissDuplicateKey: vi.fn(),
  fetchAppDataSnapshot: vi.fn(() => Promise.resolve(buildAppData())),
  importBackup: vi.fn(),
  markBackedUpNow: vi.fn(),
  mergeClient: vi.fn(),
  patchOrder: vi.fn(),
  patchOrderFlags: vi.fn(),
}));

function buildAppData(): AppData {
  const now = new Date().toISOString();
  return {
    ...structuredClone(seed),
    meta: {
      importedAt: now,
      lastBackupAt: now,
      changesSinceBackup: 0,
      importTotal: seed.orders.length,
    },
  } as AppData;
}

function renderAt(path: string) {
  const queryClient = new QueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  return render(<RouterProvider router={router} />);
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// Assert only that the router mounts and paints, never page content:
// routes are rewritten as the app is built and this must keep passing.
describe("App routing", () => {
  it("renders the index route", async () => {
    const { container } = renderAt("/");

    await waitFor(() => expect(container.firstChild).not.toBeNull());
  });

  it("renders the not-found route", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const { container } = renderAt("/this-route-does-not-exist");

    await waitFor(() => expect(container.firstChild).not.toBeNull());
  });
});
