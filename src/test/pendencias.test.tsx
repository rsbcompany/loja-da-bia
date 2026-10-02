import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import type { AppData, Order } from "@/lib/bia/types";
import { Pendencias } from "@/components/bia/screens";
import { toast } from "sonner";

const { updateOrder, onOpen } = vi.hoisted(() => ({ updateOrder: vi.fn(), onOpen: vi.fn() }));

vi.mock("@/lib/bia/store", () => ({
  useStore: () => ({ data: pendenciasFixture(), updateOrder }),
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn(), warning: vi.fn() }),
}));

function pendenciasFixture(): AppData {
  return {
    version: 1,
    orders: [
      orderFixture({ id: "n1", status: "pago", valor: 100 }),
      orderFixture({
        id: "n2",
        status: "pendente",
        clienteKey: "cliente 01",
        cliente: "Cliente 01",
        valor: 100,
      }),
      orderFixture({
        id: "n3",
        status: "pendente",
        clienteKey: "cliente 02",
        cliente: "Cliente 02",
        valor: 50,
      }),
    ],
    clients: [
      {
        key: "cliente 01",
        nome: "Cliente 01",
        variantes: ["Cliente 01"],
        whatsapp: "1199999999",
        instagram: "",
        enderecos: [],
        notas: "",
      },
      {
        key: "cliente 02",
        nome: "Cliente 02",
        variantes: ["Cliente 02"],
        whatsapp: "",
        instagram: "",
        enderecos: [],
        notas: "",
      },
    ],
    catalog: [],
    meta: {
      importedAt: "2026-01-01T00:00:00Z",
      lastBackupAt: "2026-01-01T00:00:00Z",
      changesSinceBackup: 0,
      importTotal: 0,
    },
  };
}

function orderFixture(overrides: Partial<Order> = {}): Order {
  return {
    id: "n1",
    clienteKey: "cliente 01",
    cliente: "Cliente 01",
    produto: "Produto 01",
    qtd: 1,
    valor: 100,
    status: "pendente",
    data: "2026-09-30",
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
  };
}

describe("Pendencias quick actions", () => {
  beforeEach(() => {
    updateOrder.mockClear();
    vi.mocked(toast.success).mockClear();
  });

  it("marks a paid order as sent after confirmation", async () => {
    const user = userEvent.setup();
    render(<Pendencias onOpen={onOpen} />);

    await user.click(screen.getByRole("button", { name: /enviado/i }));
    await user.click(screen.getByRole("button", { name: "Confirmar envio" }));

    expect(updateOrder).toHaveBeenCalledWith("n1", { status: "enviado" });
  });

  it("asks before sending and allows canceling", async () => {
    const user = userEvent.setup();
    render(<Pendencias onOpen={onOpen} />);

    await user.click(screen.getByRole("button", { name: /enviado/i }));

    expect(screen.getByRole("dialog", { name: "Marcar como enviado?" })).not.toBeNull();
    expect(updateOrder).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(updateOrder).not.toHaveBeenCalled();
  });

  it("saves the tracking number typed in the send sheet", async () => {
    const user = userEvent.setup();
    render(<Pendencias onOpen={onOpen} />);

    await user.click(screen.getByRole("button", { name: /enviado/i }));
    await user.type(screen.getByLabelText("Código de rastreio (opcional)"), "BR123456789BR");
    await user.click(screen.getByRole("button", { name: "Confirmar envio" }));

    expect(updateOrder).toHaveBeenCalledWith("n1", {
      status: "enviado",
      rastreio: "BR123456789BR",
    });
  });

  it("omits tracking when none is typed", async () => {
    const user = userEvent.setup();
    render(<Pendencias onOpen={onOpen} />);

    await user.click(screen.getByRole("button", { name: /enviado/i }));
    await user.click(screen.getByRole("button", { name: "Confirmar envio" }));

    expect(updateOrder).toHaveBeenCalledWith("n1", { status: "enviado" });
  });

  it("offers undo in the confirmation toast", async () => {
    const user = userEvent.setup();
    render(<Pendencias onOpen={onOpen} />);

    await user.click(screen.getByRole("button", { name: /enviado/i }));
    await user.click(screen.getByRole("button", { name: "Confirmar envio" }));

    const undoCall = (toast.success as Mock).mock.calls.find(
      ([, options]) => (options as { action?: { label?: string } })?.action,
    );
    expect(undoCall?.[0]).toBe("Marcado como enviado");
    expect((undoCall?.[1] as { action: { label: string } }).action.label).toBe("Desfazer");
  });

  it("restores the previous status when undo is tapped", async () => {
    const user = userEvent.setup();
    render(<Pendencias onOpen={onOpen} />);

    await user.click(screen.getByRole("button", { name: /enviado/i }));
    await user.click(screen.getByRole("button", { name: "Confirmar envio" }));
    const undoCall = (toast.success as Mock).mock.calls.find(
      ([, options]) => (options as { action?: { onClick?: () => void } })?.action,
    );
    (undoCall?.[1] as { action: { onClick: () => void } }).action.onClick();

    expect(updateOrder).toHaveBeenLastCalledWith("n1", { status: "pago" });
  });
});

describe("Pendencias cobranca", () => {
  beforeEach(() => {
    updateOrder.mockClear();
    vi.mocked(toast.success).mockClear();
    vi.restoreAllMocks();
  });

  async function openCobrarQueue() {
    const user = userEvent.setup();
    render(<Pendencias onOpen={onOpen} />);
    await user.click(screen.getByRole("button", { name: /Falta cobrar/ }));
    return user;
  }

  it("offers the WhatsApp charge as the primary action", async () => {
    await openCobrarQueue();

    expect(screen.getAllByRole("button", { name: "Cobrar no WhatsApp" })).toHaveLength(1);
    expect(screen.getByRole("button", { name: "✓ Pago" })).not.toBeNull();
  });

  it("opens WhatsApp with the pre-filled charge message", async () => {
    const openSpy = vi.spyOn(window, "open").mockReturnValue(null);
    const user = await openCobrarQueue();

    const chargeBtn = screen.getAllByRole("button", { name: "Cobrar no WhatsApp" }).at(0);
    if (!chargeBtn) throw new Error("charge button missing");
    await user.click(chargeBtn);

    const url = openSpy.mock.calls[0]?.[0] ?? "";
    expect(String(url)).toContain("https://wa.me/551199999999?text=");
    const message = decodeURIComponent(String(url).split("?text=")[1] ?? "");
    expect(message).toContain("Cliente 01");
    expect(message).toContain("Produto 01");
    expect(message).toContain("×1");
  });

  it("routes missing numbers to the client registration sheet", async () => {
    const user = await openCobrarQueue();

    await user.click(screen.getByRole("button", { name: "Cadastrar número" }));

    expect(screen.getByRole("dialog", { name: "Cliente 02" })).not.toBeNull();
    expect(screen.getByLabelText("WhatsApp")).not.toBeNull();
  });
});
