# Roadmap

## Entregue

- **Contato rápido (antiga Fase 1):** botões de WhatsApp na linha do pedido e
  na cobrança ("Cobrar no WhatsApp"), máscara/validação de telefone, envio com
  código de rastreio e confirmação com desfazer.

## Fase 0: Nova Base de Dados (Backend Autenticado)

Foco: colocar os dados reais em um banco privado, atrás de um backend
autenticado — hoje o app é local-first no IndexedDB, sem servidor, e dados
reais não podem ficar expostos em repositório público ou bundle.

### Backend autenticado

- Criar a camada de API seguindo [folder-structure.md](docs/agents-rules/folder-structure.md):
  `server/` com `routes` (HTTP), `services` (regras de negócio), `data`
  (banco/integrações) e `types`.
- Autenticação por usuária; nenhuma rota pública expõe pedidos ou clientes.

### Banco relacional privado

- Banco próprio (PostgreSQL) — nunca hospedado junto ao bundle público.
- Seguir [database.md](docs/agents-rules/database.md), Parte B: validar toda
  query no `psql`, rodar `EXPLAIN ANALYZE` e criar índice para todo `WHERE`.
- Sem hard-delete: exclusão por flags (`deleted_at`, `archived_at`), preservando
  a invariante `total = imported + created`.

### Migração dos dados reais

- Importar os pedidos da planilha (versionados em `src/data/seed.json`) para o
  banco privado via `bun run db:import`.
- Migrar o app do IndexedDB para a API autenticada, mantendo as telas atuais.

## Fase 1: Assistente de IA para Entrada Rápida (No próprio App)

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

## Fase 2: Captura Automática em Segundo Plano (Webhooks)

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

## Fase 3: Agente Copiloto Ativo (Atendimento Autônomo)

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
