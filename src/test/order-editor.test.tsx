import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Order } from "@/lib/bia/types";
import { OrderEditor } from "@/components/bia/OrderEditor";

const { addOrder, updateOrder, onClose } = vi.hoisted(() => ({
  addOrder: vi.fn(),
  updateOrder: vi.fn(),
  onClose: vi.fn(),
}));

vi.mock("@/lib/bia/store", () => ({
  useStore: () => ({
    data: {
      version: 1,
      orders: [],
      clients: [
        {
          key: "cliente 01",
          nome: "Cliente 01",
          variantes: ["Cliente 01"],
          whatsapp: "",
          instagram: "",
          enderecos: [],
          notas: "",
        },
      ],
      catalog: [{ nome: "Produto 01", preco: 14.5 }],
      meta: {
        importedAt: "2026-01-01T00:00:00Z",
        lastBackupAt: "2026-01-01T00:00:00Z",
        changesSinceBackup: 0,
        importTotal: 0,
      },
    },
    addOrder,
    updateOrder,
  }),
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn(), warning: vi.fn() }),
}));

import { toast } from "sonner";

function orderFixture(overrides: Partial<Order> = {}): Order {
  return {
    id: "n1",
    clienteKey: "cliente 01",
    cliente: "Cliente 01",
    produto: "Produto 01",
    qtd: 2,
    valor: 45.5,
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

describe("OrderEditor", () => {
  beforeEach(() => {
    addOrder.mockClear();
    updateOrder.mockClear();
    onClose.mockClear();
    vi.mocked(toast).mockClear();
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
    vi.mocked(toast.warning).mockClear();
  });

  it("renders the primary CTA inside the sticky footer", () => {
    render(<OrderEditor open onClose={onClose} />);

    const cta = screen.getByRole("button", { name: "Registrar pedido" });
    expect(cta.closest("div.border-t")).not.toBeNull();
  });

  it("starts with extras collapsed for a blank new order", () => {
    render(<OrderEditor open onClose={onClose} />);

    const toggle = screen.getByRole("button", { name: /Mais detalhes/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Entrega")).toBeNull();
  });

  it("reveals extras when the disclosure is expanded", async () => {
    const user = userEvent.setup();
    render(<OrderEditor open onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: /Mais detalhes/ }));

    expect(screen.getByText("Entrega")).not.toBeNull();
    expect(screen.getByRole("button", { name: /Mais detalhes/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("auto-expands extras when editing an order that already has them", () => {
    render(
      <OrderEditor
        open
        order={orderFixture({ obs: "ligar", entrega: "Retirada" })}
        onClose={onClose}
      />,
    );

    expect(screen.getByLabelText("Observações")).not.toBeNull();
    expect(screen.getByRole("button", { name: /Mais detalhes/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("submits a valid new order and closes", async () => {
    const user = userEvent.setup();
    render(<OrderEditor open onClose={onClose} />);

    await user.type(screen.getByLabelText("Cliente"), "Cliente 01");
    await user.type(screen.getByLabelText("Produto"), "Produto 01");
    await user.click(screen.getByRole("button", { name: "Registrar pedido" }));

    await waitFor(() => expect(addOrder).toHaveBeenCalledTimes(1));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("blocks submission without cliente and produto", async () => {
    const user = userEvent.setup();
    render(<OrderEditor open onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Registrar pedido" }));

    expect(addOrder).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes without a guard when nothing was typed", async () => {
    const user = userEvent.setup();
    render(<OrderEditor open onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Fechar" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("asks before discarding typed changes on close", async () => {
    const user = userEvent.setup();
    render(<OrderEditor open onClose={onClose} />);

    await user.type(screen.getByLabelText("Cliente"), "Cliente 01");
    await user.click(screen.getByRole("button", { name: "Fechar" }));

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Continuar editando" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Descartar" })).not.toBeNull();
  });

  it("returns to editing after choosing continue", async () => {
    const user = userEvent.setup();
    render(<OrderEditor open onClose={onClose} />);

    await user.type(screen.getByLabelText("Cliente"), "Cliente 01");
    await user.click(screen.getByRole("button", { name: "Fechar" }));
    await user.click(screen.getByRole("button", { name: "Continuar editando" }));

    expect(screen.getByRole("button", { name: "Registrar pedido" })).not.toBeNull();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("discards and closes after confirming discard", async () => {
    const user = userEvent.setup();
    render(<OrderEditor open onClose={onClose} />);

    await user.type(screen.getByLabelText("Cliente"), "Cliente 01");
    await user.click(screen.getByRole("button", { name: "Fechar" }));
    await user.click(screen.getByRole("button", { name: "Descartar" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("warns instead of celebrating when a pendente order is saved without value", async () => {
    const user = userEvent.setup();
    render(<OrderEditor open onClose={onClose} />);

    await user.type(screen.getByLabelText("Cliente"), "Cliente 01");
    await user.type(screen.getByLabelText("Produto"), "Produto 9");
    await user.click(screen.getByRole("button", { name: "Registrar pedido" }));

    await waitFor(() => expect(addOrder).toHaveBeenCalledTimes(1));
    expect(addOrder).toHaveBeenCalledWith(expect.objectContaining({ valor: 0 }));
    expect(toast.warning).toHaveBeenCalledWith(
      "Pedido salvo sem valor — ele não aparece em Pendências",
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
