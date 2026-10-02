import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AppData, Client, Order } from "./types";
import { ApiError } from "@/services/ApiError";
import {
  createNewOrder,
  dismissDuplicateKey,
  fetchAppDataSnapshot,
  importBackup,
  markBackedUpNow,
  mergeClient,
  patchOrder,
  patchOrderFlags,
} from "@/services/api";
import { LoginScreen } from "@/components/bia/LoginScreen";
import type { NewOrder } from "../../../server/types/NewOrder";

const APP_QUERY_KEY = ["app-data"] as const;

interface Ctx {
  data: AppData | null;
  addOrder: (o: NewOrder) => void;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  setOrderFlags: (id: string, patch: Partial<Order>) => void;
  saveClient: (oldKey: string, c: Client) => void;
  replaceAll: (d: AppData) => void;
  markBackup: () => void;
  dismissDup: (k: string) => void;
}
const C = createContext<Ctx | null>(null);

export function validateBackup(x: unknown): x is AppData {
  const d = x as AppData;
  return (
    !!d &&
    Array.isArray(d.orders) &&
    Array.isArray(d.clients) &&
    Array.isArray(d.catalog) &&
    !!d.meta &&
    d.orders.every(
      (o) =>
        typeof o.id === "string" && typeof o.valor === "number" && typeof o.status === "string",
    )
  );
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const state = useAppDataState();
  if (state.phase === "loading") return <BootSplash />;
  if (state.phase === "unauthorized") return <LoginScreen onDone={state.reload} />;
  if (state.phase === "error") return <BootError onRetry={state.reload} />;
  return <C.Provider value={state.value}>{children}</C.Provider>;
}

type AppState = {
  phase: "loading" | "unauthorized" | "error" | "ready";
  value: Ctx;
  reload: () => void;
};

function useAppDataState(): AppState {
  const query = useQuery({ queryKey: APP_QUERY_KEY, queryFn: fetchAppDataSnapshot });
  const value = useStoreValue(query.data ?? null);
  if (query.isPending) return { phase: "loading", value, reload: query.refetch };
  if (isUnauthorized(query.error)) return { phase: "unauthorized", value, reload: query.refetch };
  if (query.isError) return { phase: "error", value, reload: query.refetch };
  return { phase: "ready", value, reload: query.refetch };
}

function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

function useStoreValue(data: AppData | null): Ctx {
  const queryClient = useQueryClient();
  const run = useRunMutation(queryClient);
  return useMemo(() => buildStoreActions(data, run), [data, run]);
}

type RunMutation = (action: () => Promise<AppData>, message?: string) => Promise<void>;

function useRunMutation(queryClient: ReturnType<typeof useQueryClient>): RunMutation {
  return useCallback(
    async (action, message = "Não foi possível salvar as alterações") => {
      try {
        queryClient.setQueryData(APP_QUERY_KEY, await action());
      } catch {
        toast.error(message);
      }
    },
    [queryClient],
  );
}

function buildStoreActions(data: AppData | null, run: RunMutation): Ctx {
  return {
    data,
    addOrder: (o) => void run(() => createNewOrder(o)),
    updateOrder: (id, patch) => void run(() => patchOrder({ id, patch })),
    setOrderFlags: (id, patch) => void run(() => patchOrderFlags({ id, patch })),
    saveClient: (oldKey, c) => void run(() => mergeClient({ oldKey, client: c })),
    replaceAll: (d) => void run(() => importBackup(d), "Falha ao importar o backup"),
    markBackup: () => void run(() => markBackedUpNow()),
    dismissDup: (k) => void run(() => dismissDuplicateKey(k)),
  };
}

function BootSplash() {
  return (
    <div className="grid min-h-screen place-items-center bg-background font-display text-2xl text-foreground">
      Loja da Bia…
    </div>
  );
}

function BootError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 text-center">
      <div>
        <p className="font-display text-xl font-semibold text-foreground">
          Não foi possível carregar os dados
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Confira sua conexão e tente novamente.</p>
        <button
          onClick={onRetry}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Tentar de novo
        </button>
      </div>
    </div>
  );
}

export function useStore() {
  const c = useContext(C);
  if (!c) throw new Error("useStore outside provider");
  return c;
}
