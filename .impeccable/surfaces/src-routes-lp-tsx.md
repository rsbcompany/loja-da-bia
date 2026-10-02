---
version: 1
slug: "src-routes-lp-tsx"
primary_target: "src/routes/lp.tsx"
related_targets: []
---

# Surface brief — /lp (LP "Como funciona")

## Scope and mode

Rota `/lp` do app Loja da Bia. Modo **Persuade**: a Bia entende como o app
funciona em 30 segundos e clica "Abrir o app". Mobile-first (o app é celular),
desktop em duas colunas.

## Audience, job, action, proof

- **Audience:** Bia, dona da loja, não técnica, lendo no celular.
- **Job:** entender o fluxo do app antes de usá-lo de verdade.
- **Action:** CTA "Abrir o app" (link interno para `/`).
- **Proof:** mini-telas construídas com a anatomia real do app (Pendências,
  Pedidos, Clientes, Resumo) e o roadmap real (`roadmap.md`). Todo dado de
  demonstração é sintético e rotulado "Exemplo". Métricas públicas, clientes e
  depoimentos: não existem, não inventar.

## Constraints

- Mundo visual herdado do app (tokens de `src/styles.css`); nada de mundo novo.
- Regras do repo: componentes ≤ 30 linhas, funções ≤ 5, ≤ 3 parâmetros,
  identificadores em inglês, strings de UI em pt-BR, teste de integração da
  rota.
- Honestidade: fases 1-4 são "previsto", nunca anunciadas como prontas.

## Chosen direction and memorable moment

- **Direction:** "A vida de um pedido" (concept-seed surface 786c8cf1, opção
  `vida-de-um-pedido`, build code-led).
- **Memorable moment:** a trilha de status (Chegou → Pago → Enviado →
  Entregue) e o cartão do pedido mudam conforme o scroll passa pelas etapas —
  um pedido atravessando o app em tempo real.

## World update (2026-10-01, pós-pull)

O mundo incumbent mudou upstream: o merge do redesign trouxe a skin glass
(azul `--primary` 0.54 0.15 255, fundo frio claro com lavagens radiais,
superfícies `glass-card`/`glass-panel`/`glass-bar`/`glass-control`/`glass-input`,
raio 0.625rem, sans do sistema, dark mode via `html.dark`). A LP herdou o novo
mundo — o contrato abaixo descreve a rodada original (paleta quente), mantido
como histórico da escolha de estrutura; a fidelidade agora se mede contra a
skin glass e `src/components/bia/ui.tsx` atual.

## Unresolved decisions

- Nenhuma bloqueante. Link de entrada no app (aba Sobre) decidido: sim.

## Direction contract

- THESIS: a página conta a vida de UM pedido (Maria, 2 cangas, R$ 90) de ponta
  a ponta; recusa a grade de features com ícones e o herói de métricas — a
  demonstração é o pitch.
- OWN-WORLD: mundo do app — creme quente, terracota primária, verde-accent,
  cartões raio 2xl com borda 1px, DM Sans corpo, Fraunces display; assinatura:
  trilha de status que acende com o scroll.
- STORY: a Bia entende o fluxo (chega → registra → paga → envia → entrega →
  resumo), acredita que nada se perde e clica "Abrir o app".
- FIRST VIEWPORT: título + mensagem do Direct de Maria virando cartão do
  pedido em quadro de celular; trilha sob o cartão; CTA "Abrir o app" visível.
- FORM: "A vida de um pedido" — trilha + 5 etapas com mini-telas reais + nota
  de confiança + fases 1-4 como futuro tracejado do mesmo pedido + fecho com
  CTA. Seed key 786c8cf1, code-led.
- FINISH: unreviewed and undocumented is unfinished; this build ends with the
  finish review, the verdict, DESIGN.md, and every shipping raster carrying
  its provenance.
