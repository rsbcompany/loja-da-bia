---
version: 1
slug: "src-routes-index-tsx"
primary_target: "src/routes/index.tsx"
related_targets: []
---

# Surface brief — Loja da Bia (app shell + todas as telas)

## Escopo e modo

Troca de pele do app inteiro (substituição de identidade visual), estrutura e
comportamento preservados. Modo: **Operate**. Plataforma: web mobile-only.

## Audiência e trabalho

Bia (usuária única): fila de pendências, novo pedido, cobrança no WhatsApp,
resumo do mês. Sucesso: escanear e agir em segundos, sem decoração na frente.

## Direção escolhida (pin da usuária)

**Clean neutro** — família Linear/Notion: neutros frios, borda fina, sans do
sistema, um acento só, sem decoração. O pin da usuária resolve a direção;
sem rolagem de conceitos.

## Contrato de direção

THESIS: um espaço de trabalho neutro onde os números falam; recusa o
"caderno quente" (creme, serifa editorial, cartões de raio gigante) e opera na
disciplina Linear/Notion — superfície calma, borda de 1px, um acento azul
marcando só o que merece toque.

OWN-WORLD: neutros frios — fundo oklch(~0.97 hue 250), cards brancos, borda
0.90; acento único azul oklch(0.55 0.15 255); tipografia = stack do sistema
(SF/system-ui), numerais tabulares no dinheiro; raio 10px; cards = borda 1px +
p-3.5, sem sombra; pills só em controles pequenos (chips, badges).

STORY: Bia abre e a fila aparece com contagens discretas e ações de um toque;
o azul existe apenas no FAB/CTA/ativo da navegação; nada mais pede atenção.

FIRST VIEWPORT (Pendências): título text-xl semibold + sub text-sm muted;
fileira de chips (ativo = fundo escuro neutro); cards de pedido compactos
(raio lg, borda fina) com cliente semibold à esquerda e preço tabular
semibold à direita; ação primária do card em azul; FAB azul bottom-right.

FORM: direção pinada pela usuária ("clean neutro"); sem seed key (pin vence o
roll, conforme new-work).

FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance.

## Decisões não resolvidas

Nenhuma bloqueante. (Ícone do app/manifest ficam intactos — ativos reais.)
