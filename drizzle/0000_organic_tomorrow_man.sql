CREATE TABLE "app_meta" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"imported_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_backup_at" timestamp with time zone DEFAULT now() NOT NULL,
	"changes_since_backup" integer DEFAULT 0 NOT NULL,
	"import_total" integer DEFAULT 0 NOT NULL,
	"dup_dismissed" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catalog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"preco" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"key" text NOT NULL,
	"nome" text NOT NULL,
	"variantes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"whatsapp" text DEFAULT '' NOT NULL,
	"instagram" text DEFAULT '' NOT NULL,
	"enderecos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notas" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"cliente_key" text NOT NULL,
	"cliente" text NOT NULL,
	"produto" text NOT NULL,
	"qtd" integer NOT NULL,
	"valor" double precision NOT NULL,
	"status" text NOT NULL,
	"data" date NOT NULL,
	"pgto" text DEFAULT '' NOT NULL,
	"obs" text DEFAULT '' NOT NULL,
	"detalhe" text DEFAULT '' NOT NULL,
	"entrega" text DEFAULT '' NOT NULL,
	"valor_original" text,
	"status_original" text,
	"data_original" text,
	"pgto_original" text,
	"cliente_original" text,
	"linha_origem" integer,
	"flags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"flags_resolvidas" jsonb,
	"arquivado" boolean DEFAULT false NOT NULL,
	"motivo_arquivo" text DEFAULT '' NOT NULL,
	"excluido" boolean DEFAULT false NOT NULL,
	"historico" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"criado_em" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "app_meta" ADD CONSTRAINT "app_meta_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catalog" ADD CONSTRAINT "catalog_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "catalog_user_nome_idx" ON "catalog" USING btree ("user_id","nome");--> statement-breakpoint
CREATE UNIQUE INDEX "clients_user_key_idx" ON "clients" USING btree ("user_id","key");--> statement-breakpoint
CREATE INDEX "orders_user_data_idx" ON "orders" USING btree ("user_id","data");--> statement-breakpoint
CREATE INDEX "orders_user_status_idx" ON "orders" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "orders_user_cliente_idx" ON "orders" USING btree ("user_id","cliente_key");