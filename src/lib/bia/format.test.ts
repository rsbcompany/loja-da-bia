import { describe, expect, it } from "vitest";
import type { Order } from "@/lib/bia/types";
import { buildCobrancaMessage, formatOrderCount, waLink } from "./format";

const orderFixture: Order = {
  id: "n1",
  clienteKey: "maria",
  cliente: "Maria",
  produto: "Vestido",
  qtd: 2,
  valor: 89.9,
  status: "pendente",
  data: "2026-10-01",
  pgto: "",
  obs: "",
  detalhe: "",
  entrega: "",
  flags: [],
  arquivado: false,
  motivoArquivo: "",
  excluido: false,
  historico: [],
};

describe("waLink", () => {
  it("keeps plain international numbers untouched", () => {
    expect(waLink("551199999999")).toBe("https://wa.me/551199999999");
  });
  it("adds the brazilian country code to local numbers", () => {
    expect(waLink("1199999999")).toBe("https://wa.me/551199999999");
  });
  it("strips leading zeros before normalizing", () => {
    expect(waLink("011 99999-9999")).toBe("https://wa.me/5511999999999");
  });
  it("returns empty for missing numbers", () => {
    expect(waLink("")).toBe("");
  });
  it("appends the pre-filled message when given", () => {
    expect(waLink("1199999999", "oi")).toBe("https://wa.me/551199999999?text=oi");
  });
});

describe("buildCobrancaMessage", () => {
  it("speaks the charge with order context", () => {
    const message = buildCobrancaMessage(orderFixture);
    expect(message).toContain("Maria");
    expect(message).toContain("Vestido");
    expect(message).toContain("×2");
    expect(message).toContain("R$\u00a089,90");
  });
});

describe("formatOrderCount", () => {
  it("uses singular for one order", () => {
    expect(formatOrderCount(1)).toBe("1 pedido");
  });
  it("uses plural for zero and many orders", () => {
    expect(formatOrderCount(0)).toBe("0 pedidos");
    expect(formatOrderCount(28)).toBe("28 pedidos");
  });
});
