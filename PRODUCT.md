# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Bia, dona da Loja da Bia — usuária única confirmada. Usa o app **no celular**,
em momentos curtos entre as tarefas do dia (lançar pedido, conferir o que
precisa de atenção, marcar como pago/enviado). Os pedidos chegam por canais
diretos (WhatsApp, Instagram) e são lançados/importados por ela mesma.

## Product Purpose

Gestão de pedidos da loja, local-first e offline, rodando no navegador com
IndexedDB — sem backend. O app é o caderno operacional da Bia: fila de
pendências com ações de um toque, catálogo de produtos para novo pedido,
clientes com contato rápido (WhatsApp/Instagram), resumo financeiro mensal,
revisão de duplicados e backup.

Sucesso é: nenhum pedido esquecido, mês fechado com números claros, backup em
dia — sem atrito e sem depender de internet.

## Positioning

Caderno pessoal local-first de uma loja específica, desenhado para uma única
usuária e para a rotina real dela (WhatsApp/Instagram → pedido → cobrança →
postagem → entrega). Um produto concorrente não copia a verdade: é o registro
confiável e íntimo da operação da própria loja, sem custo de servidor e sem
expor dados de clientes.

## Operating Context

- Pedidos e clientes vivem em WhatsApp/Instagram; links diretos fazem parte do
  fluxo diário.
- Importação histórica via CSV (`tools/pedidos.csv` → seed sintético).
- Fluxo de pedido: lançado → pago → postado → enviado → arquivado.
- Backup é manual e periódico; o app lembra com aviso na tela inicial
  (≥ 30 alterações ou ≥ 7 dias).

## Capabilities and Constraints

- **Pedidos nunca são removidos definitivamente** — apenas flags de
  arquivamento/exclusão; invariante `total = imported + created`.
- Trilha de auditoria: histórico de cada alteração por campo.
- Dados reais **nunca** entram em arquivos versionados ou bundles públicos;
  cópias em `private-data/originals/` (ignorada pelo Git). Seed é sintético.
- Hoje é mobile web apenas; o roadmap define Fase 0 (backend autenticado +
  banco privado) como pré-requisito para dados reais em deploy compartilhado.
- Falhas visuais conhecidas valem como flags (status desconhecido, valor
  ilegível, data inválida) — revisão manual, exclusão automática não existe.

## Brand Commitments

- Nome: **Loja da Bia**.
- Nenhuma amarração visual declarada pela dona (entrevista 2026-10-01): a
  identidade encarnada (paleta quente oklch, Fraunces + DM Sans, mobile-first)
  é tratada como evidência — o critique aponta o que vale preservar e o que
  vale evoluir.

## Evidence on Hand

- `README.md` e `roadmap.md` — funcionalidades, fase 0 e fases 1–3 (contato
  rápido entregue), stack.
- `tools/pedidos.csv` → `src/data/seed.json` (dados sintéticos de
  demonstração, gerados por `tools/build_seed.py`).
- `private-data/originals/` — dados reais, ignorados pelo Git (não podem ser
  lidos pela sessão nem publicados).

## Product Principles

1. **Nada se perde** — pedido é registro permanente; auditoria e invariante
   de contagem nunca cedem a atalhos de UI.
2. **Um toque por decisão** — a Bia decide no celular em segundos: ação
   primária evidente, uma tela por vez.
3. **Privacidade por construção** — o design não pede recursos que incentivem
   colar dados reais em lugares versionados.
4. **O mês fecha sem planilha** — o resumo responde "como fui no mês" de
   relance, com números verificáveis.

## Accessibility & Inclusion

Mobile-only: áreas de toque generosas, números legíveis em telas pequenas e
conferência financeira rápida são requisitos básicos do uso confirmado. Nenhum
padrão formal (WCAG nível) foi exigido pela dona.
