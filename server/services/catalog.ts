import type { Db } from "../data/db";
import type { CatalogItem } from "@/lib/bia/types";
import { findCatalogItem, insertCatalogItem } from "../data/catalog";
import type { NewOrder } from "../types/NewOrder";

export async function ensureCatalogItem(db: Db, userId: string, input: NewOrder) {
  const known =
    !input.produto || input.qtd <= 0 || Boolean(await findCatalogItem(db, userId, input.produto));
  if (known) return;
  await insertCatalogItem(db, userId, buildCatalogItem(input));
}

function buildCatalogItem(input: NewOrder): CatalogItem {
  return {
    nome: input.produto,
    preco: Math.round((input.valor / Math.max(input.qtd, 1)) * 100) / 100,
  };
}
