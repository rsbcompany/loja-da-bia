import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { Entrega, HistoryEntry, Status } from "@/lib/bia/types";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    nome: text("nome").notNull(),
    variantes: jsonb("variantes").$type<string[]>().notNull().default([]),
    whatsapp: text("whatsapp").notNull().default(""),
    instagram: text("instagram").notNull().default(""),
    enderecos: jsonb("enderecos").$type<string[]>().notNull().default([]),
    notas: text("notas").notNull().default(""),
  },
  (table) => [uniqueIndex("clients_user_key_idx").on(table.userId, table.key)],
);

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    clienteKey: text("cliente_key").notNull(),
    cliente: text("cliente").notNull(),
    produto: text("produto").notNull(),
    qtd: integer("qtd").notNull(),
    valor: doublePrecision("valor").notNull(),
    status: text("status").notNull().$type<Status>(),
    data: date("data").notNull(),
    pgto: text("pgto").notNull().default(""),
    obs: text("obs").notNull().default(""),
    detalhe: text("detalhe").notNull().default(""),
    entrega: text("entrega").notNull().$type<Entrega>().default(""),
    valorOriginal: text("valor_original"),
    statusOriginal: text("status_original"),
    dataOriginal: text("data_original"),
    pgtoOriginal: text("pgto_original"),
    clienteOriginal: text("cliente_original"),
    linhaOrigem: integer("linha_origem"),
    flags: jsonb("flags").$type<string[]>().notNull().default([]),
    flagsResolvidas: jsonb("flags_resolvidas").$type<string[]>(),
    arquivado: boolean("arquivado").notNull().default(false),
    motivoArquivo: text("motivo_arquivo").notNull().default(""),
    excluido: boolean("excluido").notNull().default(false),
    historico: jsonb("historico").$type<HistoryEntry[]>().notNull().default([]),
    criadoEm: timestamp("criado_em", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("orders_user_data_idx").on(table.userId, table.data),
    index("orders_user_status_idx").on(table.userId, table.status),
    index("orders_user_cliente_idx").on(table.userId, table.clienteKey),
  ],
);

export const catalog = pgTable(
  "catalog",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    nome: text("nome").notNull(),
    preco: doublePrecision("preco").notNull(),
  },
  (table) => [uniqueIndex("catalog_user_nome_idx").on(table.userId, table.nome)],
);

export const appMeta = pgTable("app_meta", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  importedAt: timestamp("imported_at", { withTimezone: true }).notNull().defaultNow(),
  lastBackupAt: timestamp("last_backup_at", { withTimezone: true }).notNull().defaultNow(),
  changesSinceBackup: integer("changes_since_backup").notNull().default(0),
  importTotal: integer("import_total").notNull().default(0),
  dupDismissed: jsonb("dup_dismissed").$type<string[]>().notNull().default([]),
});
