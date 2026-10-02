import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/bia/store";
import type { Order } from "@/lib/bia/types";
import {
  buildForm,
  hasFilledExtras,
  isValidForm,
  nextQtdForm,
  parseVal,
} from "@/lib/bia/order-form";
import type { OrderForm } from "@/types/OrderForm";

export function useOrderForm(order?: Order) {
  const { data, addOrder, updateOrder } = useStore();
  const [form, setForm] = useState<OrderForm>(() => buildForm(order));
  const [savedForm, setSavedForm] = useState<OrderForm>(() => buildForm(order));
  const [extrasOpen, setExtrasOpen] = useState(() => hasFilledExtras(order));
  const clientes = useMemo(() => data?.clients.map((c) => c.nome).sort() ?? [], [data]);
  const catalog = data?.catalog ?? [];
  const dirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedForm),
    [form, savedForm],
  );
  const price = (nome: string) =>
    catalog.find((c) => c.nome.toLowerCase() === nome.toLowerCase())?.preco;
  const set = (patch: Partial<OrderForm>) => setForm((current) => ({ ...current, ...patch }));
  const setQtd = (next: number) =>
    setForm((current) => nextQtdForm(current, next, price(current.produto)));
  const notifySave = () => {
    const savedWithoutValue = form.status === "pendente" && parseVal(form.valor) === 0;
    if (savedWithoutValue) toast.warning("Pedido salvo sem valor — ele não aparece em Pendências");
    else toast.success(order ? "Pedido atualizado" : "Pedido registrado");
  };
  const commit = () => {
    const payload = {
      ...form,
      cliente: form.cliente.trim(),
      produto: form.produto.trim(),
      valor: parseVal(form.valor),
      rastreio: form.rastreio.trim(),
    };
    if (order) updateOrder(order.id, payload);
    else addOrder(payload);
  };
  const save = () => {
    if (!isValidForm(form)) {
      toast.error("Informe cliente e produto");
      return false;
    }
    commit();
    setSavedForm(form);
    notifySave();
    return true;
  };
  return { form, set, setQtd, clientes, catalog, price, dirty, extrasOpen, setExtrasOpen, save };
}
