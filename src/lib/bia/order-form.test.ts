import { describe, expect, it } from "vitest";
import type { Order } from "@/lib/bia/types";
import type { OrderForm } from "@/types/OrderForm";
import { buildForm, hasFilledExtras, isValidForm, nextQtdForm, parseVal } from "./order-form";

const orderFixture: Order = {
  id: "n1",
  clienteKey: "cliente 01",
  cliente: "Cliente 01",
  produto: "Produto 01",
  qtd: 2,
  valor: 45.5,
  status: "pendente",
  data: "2026-09-30",
  pgto: "Pix",
  obs: "ligar",
  detalhe: "azul",
  entrega: "Retirada",
  flags: [],
  arquivado: false,
  motivoArquivo: "",
  excluido: false,
  historico: [],
};

describe("parseVal", () => {
  it("parses brazilian decimal comma with thousands dot", () => {
    expect(parseVal("1.234,56")).toBe(1234.56);
  });
  it("parses currency prefix and spaces", () => {
    expect(parseVal("R$ 10,50")).toBe(10.5);
  });
  it("parses plain dot decimals", () => {
    expect(parseVal("12.5")).toBe(12.5);
  });
  it("returns zero for garbage input", () => {
    expect(parseVal("abc")).toBe(0);
  });
});

describe("buildForm", () => {
  it("returns blank defaults without an order", () => {
    const form = buildForm();
    expect(form.cliente).toBe("");
    expect(form.qtd).toBe(1);
    expect(form.status).toBe("pendente");
    expect(form.valor).toBe("");
  });
  it("maps an existing order into editable string fields", () => {
    const form = buildForm(orderFixture);
    expect(form.cliente).toBe("Cliente 01");
    expect(form.valor).toBe("45,50");
    expect(form.entrega).toBe("Retirada");
  });
});

describe("nextQtdForm", () => {
  const base: OrderForm = buildForm();

  it("multiplies catalog unit price by quantity", () => {
    const next = nextQtdForm(base, 3, 10);
    expect(next.qtd).toBe(3);
    expect(next.valor).toBe("30,00");
  });
  it("derives unit price from current total when catalog misses", () => {
    const withTotal: OrderForm = { ...base, qtd: 2, valor: "10,00" };
    expect(nextQtdForm(withTotal, 4).valor).toBe("20,00");
  });
  it("never goes below one unit", () => {
    expect(nextQtdForm(base, 0).qtd).toBe(1);
  });
  it("keeps typed value when no unit price is derivable", () => {
    expect(nextQtdForm(base, 2).valor).toBe("");
  });
});

describe("hasFilledExtras", () => {
  it("is false without an order", () => {
    expect(hasFilledExtras(undefined)).toBe(false);
  });
  it("is false for an order with empty extras", () => {
    const order = { ...orderFixture, obs: "", detalhe: "", entrega: "" as const };
    expect(hasFilledExtras(order)).toBe(false);
  });
  it("is true when any extra field is filled", () => {
    expect(hasFilledExtras(orderFixture)).toBe(true);
  });
});

describe("isValidForm", () => {
  it("rejects blank cliente or produto", () => {
    expect(isValidForm(buildForm())).toBe(false);
  });
  it("accepts trimmed cliente and produto", () => {
    const form: OrderForm = { ...buildForm(), cliente: " Bia ", produto: "Produto 01" };
    expect(isValidForm(form)).toBe(true);
  });
});
