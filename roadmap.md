# Roadmap

## Fase 0: Nova Base de Dados (Backend Autenticado)

Foco: colocar os dados reais em um banco privado, atrás de um backend
autenticado — dados sensíveis não podem ficar expostos em repositório público
ou bundle.

### Backend autenticado

- [x] Camada RPC em `src/services/api.ts` (`createServerFn`) e regras em
      `server/services/` — sessão por cookie `HttpOnly` (`ldb_session`).
- [x] Sem registro público: a primeira conta nasce só via
      `bun run db:owner <email> <senha>`.

### Banco relacional privado

- [x] Postgres (Neon) com Drizzle: schema em `server/data/schema.ts`,
      migrations versionadas em `drizzle/` (`bun run db:migrate`).
- [x] Índices para as consultas ativas (usuário+data, usuário+status,
      usuário+cliente) e exclusão apenas por flags — sem hard-delete.

### Migração dos dados reais

- [ ] Criar o projeto na Neon e preencher `DATABASE_URL` no `.env`.
- [ ] Aplicar migrations (`bun run db:migrate`) e criar a conta (`db:owner`).
- [ ] Importar os pedidos originais de `private-data/originals/src-data-seed.json`
      via `bun run db:import` — eles não voltam para arquivos versionados.

## Fase 1: Higienização e Contato Rápido (Quick Win no App)

## Fase 1: Higienização e Contato Rápido (Quick Win no App)

Foco: agilizar o contato diário e corrigir a base de clientes sem sair da tela
de pedidos.

### Validação e Máscara de Telefone

- Máscara automática padrão Brasil `(XX) XXXXX-XXXX` e formato internacional
  (E.164) para garantir links do WhatsApp válidos.

### Atalho de WhatsApp na Linha do Pedido

- Botão direto ao lado do nome do cliente:
  - Se tem telefone cadastrado: abre o WhatsApp com um toque.
  - Se não tem telefone: abre um modal rápido para preencher o número ali
    mesmo, atualizando o cadastro sem trocar de tela.

## Fase 2: Assistente de IA para Entrada Rápida (No próprio App)

Foco: tirar o trabalho braçal de digitar itens, preços e observações, com custo
zero de API externa e sem risco de banimento.

### Caixa "Colar Mensagem ou Áudio"

- Campo na tela de Novo Pedido onde a Bia cola o texto copiado do
  Direct/WhatsApp ou sobe o áudio da cliente.

### Extração Inteligente com IA

- A IA interpreta linguagem natural e gírias, identificando: cliente, produtos,
  quantidades, forma de pagamento e observações.

### Revisão com 1 Clique

- O formulário é pré-preenchido automaticamente para a Bia só bater o olho e
  salvar.

## Fase 3: Captura Automática em Segundo Plano (Webhooks)

Foco: os pedidos caírem sozinhos no app sem a Bia precisar copiar e colar nada.

### Recepção de Mensagens

- Conexão do canal (via API Oficial da Meta ou instância dedicada) recebendo as
  mensagens diretamente por webhook.

### Inbox de "Pedidos a Confirmar"

- A IA processa cada mensagem recebida e cria um rascunho de pedido direto na
  aba de Pendências.

### Aprovação da Bia

- A Bia revisa a lista de pendentes e aprova os pedidos legítimos com um toque,
  disparando a confirmação para a cliente.

## Fase 4: Agente Copiloto Ativo (Atendimento Autônomo)

Foco: o agente responder os clientes e tirar dúvidas rotineiras antes de
envolver a Bia.

### Respostas Automáticas de Apoio

- O agente responde dúvidas simples no WhatsApp (disponibilidade de catálogo,
  chave Pix, prazo de entrega).

### Fechamento Guiado

- Solicita confirmação de endereço ou comprovante de pagamento à cliente de
  forma conversacional.

### Transbordo Humano

- Quando o cliente pede desconto, negociação ou faz perguntas fora do padrão, a
  IA pausa e chama a Bia para assumir a conversa.
