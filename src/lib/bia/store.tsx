import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import seed from "@/data/seed.json";
import type { AppData, Client, Order } from "./types";
import { clientKey, todayISO } from "./format";

const DB = "loja-da-bia";
const STORE = "kv";
const KEY = "data";

function openDB(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function idbGet(): Promise<AppData | undefined> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const r = db.transaction(STORE).objectStore(STORE).get(KEY);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function idbSet(v: AppData) {
  const db = await openDB();
  return new Promise<void>((res, rej) => {
    const t = db.transaction(STORE, "readwrite");
    t.objectStore(STORE).put(v, KEY);
    t.oncomplete = () => res();
    t.onerror = () => rej(t.error);
  });
}

function fromSeed(): AppData {
  const now = new Date().toISOString();
  const s = structuredClone(seed) as unknown as Omit<AppData, "meta">;
  return {
    ...s,
    meta: {
      importedAt: now,
      lastBackupAt: now,
      changesSinceBackup: 0,
      importTotal: s.orders.length,
    },
  };
}

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

const FIELDS: (keyof Order)[] = [
  "cliente",
  "produto",
  "qtd",
  "valor",
  "status",
  "data",
  "pgto",
  "obs",
  "detalhe",
  "entrega",
  "rastreio",
];

interface Ctx {
  data: AppData | null;
  addOrder: (
    o: Omit<
      Order,
      "id" | "clienteKey" | "flags" | "arquivado" | "motivoArquivo" | "excluido" | "historico"
    >,
  ) => void;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  setOrderFlags: (id: string, patch: Partial<Order>) => void;
  saveClient: (oldKey: string, c: Client) => void;
  replaceAll: (d: AppData) => void;
  markBackup: () => void;
  dismissDup: (k: string) => void;
}
const C = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const ref = useRef<AppData | null>(null);

  useEffect(() => {
    (async () => {
      let d = await idbGet().catch(() => undefined);
      if (!d) {
        d = fromSeed();
        await idbSet(d);
        toast.success(`Histórico importado: ${d.orders.length} pedidos da planilha`);
      }
      navigator.storage?.persist?.().catch(() => {});
      ref.current = d;
      setData(d);
    })();
  }, []);

  const commit = useCallback((fn: (d: AppData) => AppData, countChange = true) => {
    const cur = ref.current;
    if (!cur) return;
    const next = fn(structuredClone(cur));
    if (countChange) next.meta.changesSinceBackup++;
    ref.current = next;
    setData(next);
    idbSet(next).catch(() => toast.error("Não foi possível salvar no aparelho"));
  }, []);

  const ensureClient = (d: AppData, nome: string) => {
    const k = clientKey(nome);
    const c = d.clients.find((x) => x.key === k);
    if (!c)
      d.clients.push({
        key: k,
        nome: nome.trim(),
        variantes: [nome.trim()],
        whatsapp: "",
        instagram: "",
        enderecos: [],
        notas: "",
      });
    else if (!c.variantes.includes(nome.trim())) c.variantes.push(nome.trim());
    return c?.nome ?? nome.trim();
  };

  const value: Ctx = {
    data,
    addOrder: (o) =>
      commit((d) => {
        const nome = ensureClient(d, o.cliente);
        const now = new Date().toISOString();
        d.orders.unshift({
          ...o,
          cliente: nome,
          id: `n${Date.now()}`,
          clienteKey: clientKey(nome),
          flags: [],
          arquivado: false,
          motivoArquivo: "",
          excluido: false,
          historico: [],
          criadoEm: now,
          data: o.data || todayISO(),
        });
        if (o.produto && !d.catalog.some((c) => c.nome === o.produto) && o.qtd > 0)
          d.catalog.push({ nome: o.produto, preco: Math.round((o.valor / o.qtd) * 100) / 100 });
        return d;
      }),
    updateOrder: (id, patch) =>
      commit((d) => {
        const o = d.orders.find((x) => x.id === id);
        if (!o) return d;
        const ts = new Date().toISOString();
        if (patch.cliente && patch.cliente !== o.cliente) {
          patch.cliente = ensureClient(d, patch.cliente);
          patch.clienteKey = clientKey(patch.cliente);
        }
        for (const f of FIELDS) {
          if (f in patch && String(patch[f]) !== String(o[f]))
            o.historico.push({ ts, campo: f, de: String(o[f]), para: String(patch[f]) });
        }
        for (const f of ["arquivado", "excluido"] as const) {
          if (f in patch && patch[f] !== o[f])
            o.historico.push({ ts, campo: f, de: String(o[f]), para: String(patch[f]) });
        }
        Object.assign(o, patch);
        return d;
      }),
    setOrderFlags: (id, patch) =>
      commit((d) => {
        const o = d.orders.find((x) => x.id === id);
        if (o) Object.assign(o, patch);
        return d;
      }),
    saveClient: (oldKey, c) =>
      commit((d) => {
        const k = clientKey(c.nome);
        const old = d.clients.find((x) => x.key === oldKey);
        const target = d.clients.find((x) => x.key === k && x.key !== oldKey);
        let merged: Client = { ...c, key: k };
        if (target) {
          merged = {
            ...target,
            ...c,
            key: k,
            variantes: Array.from(
              new Set([...target.variantes, ...(old?.variantes ?? []), c.nome]),
            ),
            whatsapp: c.whatsapp || target.whatsapp,
            instagram: c.instagram || target.instagram,
            enderecos: Array.from(new Set([...target.enderecos, ...c.enderecos])),
            notas: [target.notas, c.notas].filter(Boolean).join("\n"),
          };
        } else if (!merged.variantes.includes(c.nome))
          merged.variantes = [...merged.variantes, c.nome];
        d.clients = d.clients.filter((x) => x.key !== oldKey && x.key !== k);
        d.clients.push(merged);
        for (const o of d.orders)
          if (o.clienteKey === oldKey || o.clienteKey === k) {
            o.clienteKey = k;
            o.cliente = merged.nome;
          }
        return d;
      }),
    replaceAll: (nd) => commit(() => nd, false),
    dismissDup: (k) =>
      commit((d) => {
        d.meta.dupDismissed = [...(d.meta.dupDismissed ?? []), k];
        return d;
      }),
    markBackup: () =>
      commit((d) => {
        d.meta.changesSinceBackup = 0;
        d.meta.lastBackupAt = new Date().toISOString();
        return d;
      }, false),
  };
  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useStore() {
  const c = useContext(C);
  if (!c) throw new Error("useStore outside provider");
  return c;
}
