import type { Db } from "../data/db";
import type { AppData, Client } from "@/lib/bia/types";
import { clientKey } from "@/lib/bia/format";
import {
  deleteClientByKey,
  findClientByKey,
  insertClient,
  updateClientVariantes,
} from "../data/clients";
import { reassignOrdersCliente } from "../data/orders";
import { loadAppData, mapClientRow } from "./snapshot";
import type { ClientSave } from "../types/ClientSave";
import type { ClientReplace } from "../types/ClientReplace";

export async function ensureClient(db: Db, userId: string, nome: string): Promise<Client> {
  const key = buildClientKey(nome);
  const found = await findClientByKey(db, userId, key);
  if (!found) return mapClientRow(await insertClient(db, userId, buildClient(key, nome)));
  return syncClientVariant(db, userId, { client: mapClientRow(found), nome });
}

export async function saveClient(db: Db, input: ClientSave): Promise<AppData> {
  const nextKey = buildClientKey(input.client.nome);
  const merged = await mergeClientsForSave(db, input, nextKey);
  await replaceClient(db, { userId: input.userId, oldKey: input.oldKey, nextKey, merged });
  return loadAppData(db, input.userId);
}

export function mergeClients(
  incoming: Client,
  target: Client | undefined,
  previous: Client | undefined,
): Client {
  const key = buildClientKey(incoming.nome);
  if (!target) return withAddedVariante(incoming, key);
  return mergeIntoTarget(incoming, { key, target, previous });
}

function mergeIntoTarget(
  incoming: Client,
  context: { key: string; target: Client; previous: Client | undefined },
): Client {
  const { key, target, previous } = context;
  const variantes = Array.from(
    new Set([...target.variantes, ...(previous?.variantes ?? []), incoming.nome]),
  );
  const contacts = mergeContacts(target, incoming);
  return { ...target, ...incoming, key, variantes, ...contacts };
}

function mergeContacts(target: Client, incoming: Client) {
  return {
    whatsapp: incoming.whatsapp || target.whatsapp,
    instagram: incoming.instagram || target.instagram,
    enderecos: Array.from(new Set([...target.enderecos, ...incoming.enderecos])),
    notas: [target.notas, incoming.notas].filter(Boolean).join("\n"),
  };
}

function withAddedVariante(incoming: Client, key: string): Client {
  const variantes = incoming.variantes.includes(incoming.nome)
    ? incoming.variantes
    : [...incoming.variantes, incoming.nome];
  return { ...incoming, key, variantes };
}

function buildClient(key: string, nome: string): Client {
  return {
    key,
    nome: nome.trim(),
    variantes: [nome.trim()],
    whatsapp: "",
    instagram: "",
    enderecos: [],
    notas: "",
  };
}

function buildClientKey(nome: string): string {
  return clientKey(nome) || "(sem nome)";
}

async function syncClientVariant(
  db: Db,
  userId: string,
  input: { client: Client; nome: string },
): Promise<Client> {
  const { client, nome } = input;
  if (client.variantes.includes(nome)) return client;
  const variantes = [...client.variantes, nome];
  await updateClientVariantes(db, userId, { key: client.key, variantes });
  return { ...client, variantes };
}

async function mergeClientsForSave(db: Db, input: ClientSave, nextKey: string): Promise<Client> {
  const previous = await findClientByKey(db, input.userId, input.oldKey);
  const target = await findClientByKey(db, input.userId, nextKey);
  return mergeClients(input.client, target, previous);
}

async function replaceClient(db: Db, input: ClientReplace) {
  await deleteClientByKey(db, input.userId, input.oldKey);
  await deleteClientByKey(db, input.userId, input.nextKey);
  await reassignOrdersCliente(db, {
    userId: input.userId,
    fromKey: input.oldKey,
    toKey: input.nextKey,
    cliente: input.merged.nome,
  });
  await insertClient(db, input.userId, input.merged);
}
