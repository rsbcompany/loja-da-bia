import { describe, expect, it } from "vitest";
import type { Order } from "@/lib/bia/types";
import { diffHistory } from "./orders";

function buildRow(overrides: Partial<Order> = {}) {
  return {
    id: "s1",
    cliente: "Ana",
    produto: "Produto 01",
    qtd: 1,
    valor: 10,
    status: "pendente",
    data: "2025-01-01",
    pgto: "Pix",
    obs: "",
    detalhe: "",
    entrega: "",
    flags: [],
    arquivado: false,
    motivoArquivo: "",
    excluido: false,
    historico: [],
    ...overrides,
  } as unknown as Parameters<typeof diffHistory>[0];
}

describe("diffHistory", () => {
  it("records only the changed fields", () => {
    const entries = diffHistory(
      buildRow(),
      { status: "pago", obs: "entregar sexta" },
      "2026-01-01T10:00:00.000Z",
    );

    expect(entries).toEqual([
      { ts: "2026-01-01T10:00:00.000Z", campo: "status", de: "pendente", para: "pago" },
      { ts: "2026-01-01T10:00:00.000Z", campo: "obs", de: "", para: "entregar sexta" },
    ]);
  });

  it("records archive and exclusion flag changes", () => {
    const entries = diffHistory(buildRow(), { arquivado: true }, "2026-01-01T10:00:00.000Z");

    expect(entries).toEqual([
      { ts: "2026-01-01T10:00:00.000Z", campo: "arquivado", de: "false", para: "true" },
    ]);
  });

  it("returns nothing when the patch changes nothing", () => {
    const entries = diffHistory(buildRow(), { cliente: "Ana" }, "2026-01-01T10:00:00.000Z");

    expect(entries).toEqual([]);
  });
});
