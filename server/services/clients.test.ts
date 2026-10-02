import { describe, expect, it } from "vitest";
import type { Client, Order } from "@/lib/bia/types";
import { mergeClients } from "./clients";

function buildClient(overrides: Partial<Client> = {}): Client {
  return {
    key: "ana-silva",
    nome: "Ana Silva",
    variantes: ["Ana Silva"],
    whatsapp: "",
    instagram: "",
    enderecos: [],
    notas: "",
    ...overrides,
  };
}

describe("mergeClients", () => {
  it("adds the name as a variante when creating a new client", () => {
    const incoming = buildClient({ variantes: [] });

    const merged = mergeClients(incoming, undefined, undefined);

    expect(merged.variantes).toEqual(["Ana Silva"]);
  });

  it("unions variantes, addresses and notes when a target exists", () => {
    const incoming = buildClient({ whatsapp: "novo", notas: "prefere pix", enderecos: ["Rua B"] });
    const target = buildClient({
      variantes: ["ana s"],
      whatsapp: "antigo",
      enderecos: ["Rua A"],
      notas: "",
    });
    const previous = buildClient({ variantes: ["ana"], notas: "" });

    const merged = mergeClients(incoming, target, previous);

    expect(merged.variantes).toEqual(["ana s", "ana", "Ana Silva"]);
    expect(merged.enderecos).toEqual(["Rua A", "Rua B"]);
    expect(merged.whatsapp).toBe("novo");
    expect(merged.notas).toBe("prefere pix");
  });

  it("keeps the target contact when the incoming one is empty", () => {
    const incoming = buildClient({ whatsapp: "" });
    const target = buildClient({ whatsapp: "11999999999" });

    const merged = mergeClients(incoming, target, undefined);

    expect(merged.whatsapp).toBe("11999999999");
  });
});

export type { Order };
