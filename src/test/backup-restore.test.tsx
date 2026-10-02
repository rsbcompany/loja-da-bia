import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AppData, Order } from "@/lib/bia/types";
import { Backup } from "@/components/bia/screens";
import { toast } from "sonner";

const { replaceAll, markBackup } = vi.hoisted(() => ({ replaceAll: vi.fn(), markBackup: vi.fn() }));

vi.mock("@/lib/bia/store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/bia/store")>();
  return {
    ...actual,
    useStore: () => ({ data: backupFixture(), replaceAll, markBackup }),
  };
});

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn(), warning: vi.fn() }),
}));

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

function backupFixture(): AppData {
  return {
    version: 1,
    orders: [orderFixture()],
    clients: [],
    catalog: [],
    meta: {
      importedAt: "2026-01-01T00:00:00Z",
      lastBackupAt: "2026-09-15T00:00:00Z",
      changesSinceBackup: 3,
      importTotal: 0,
    },
  };
}

function fileInput(): HTMLInputElement {
  const el = document.querySelector("input[type=file]");
  if (!(el instanceof HTMLInputElement)) throw new Error("file input missing");
  return el;
}

function uploadBackupFile(user: ReturnType<typeof userEvent.setup>, content: string) {
  const file = new File([content], "backup.json", { type: "application/json" });
  return user.upload(fileInput(), file);
}

function validBackupJson(): string {
  return JSON.stringify(backupFixture());
}

describe("Backup restore", () => {
  beforeEach(() => {
    replaceAll.mockClear();
    markBackup.mockClear();
    vi.mocked(toast).mockClear();
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  it("asks with a designed confirm before replacing data", async () => {
    const user = userEvent.setup();
    render(<Backup />);

    await uploadBackupFile(user, validBackupJson());

    await waitFor(() =>
      expect(screen.getByRole("dialog", { name: "Restaurar backup?" })).not.toBeNull(),
    );
    const dialog = screen.getByRole("dialog", { name: "Restaurar backup?" });
    expect(dialog.textContent).toContain("1 pedido");
    expect(dialog.textContent).toContain("15/09/2026");
    expect(replaceAll).not.toHaveBeenCalled();
  });

  it("replaces data only after confirm", async () => {
    const user = userEvent.setup();
    render(<Backup />);

    await uploadBackupFile(user, validBackupJson());
    await waitFor(() =>
      expect(screen.getByRole("dialog", { name: "Restaurar backup?" })).not.toBeNull(),
    );
    await user.click(screen.getByRole("button", { name: "Restaurar" }));

    await waitFor(() => expect(replaceAll).toHaveBeenCalledTimes(1));
    expect(toast.success).toHaveBeenCalledWith("Backup restaurado");
  });

  it("keeps current data when canceled", async () => {
    const user = userEvent.setup();
    render(<Backup />);

    await uploadBackupFile(user, validBackupJson());
    await waitFor(() =>
      expect(screen.getByRole("dialog", { name: "Restaurar backup?" })).not.toBeNull(),
    );
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(replaceAll).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog", { name: "Restaurar backup?" })).toBeNull();
  });

  it("rejects files that are not app backups", async () => {
    const user = userEvent.setup();
    render(<Backup />);

    await uploadBackupFile(user, JSON.stringify({ hello: "world" }));

    expect(toast.error).toHaveBeenCalledWith("Arquivo inválido — não é um backup da Loja da Bia");
    expect(replaceAll).not.toHaveBeenCalled();
  });
});
