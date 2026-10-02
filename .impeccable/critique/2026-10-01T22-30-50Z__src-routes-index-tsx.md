---
target: o web app (Loja da Bia)
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
target_identity: "file:/Users/rsbcompany/orca/workspaces/bia-s-order-hub/redesign/src/routes/index.tsx"
target_fingerprint: "sha256:effc7564f74034475e038ba8abc524780e38180597746c709e0179a44db36cc9"
target_path: /Users/rsbcompany/orca/workspaces/bia-s-order-hub/redesign/src/routes/index.tsx
timestamp: 2026-10-01T22-30-50Z
slug: src-routes-index-tsx
closed: true
---
# Crítica — Loja da Bia (app inteiro)

**Method: dual-agent (A: ses_f067079a4ffeX48kKTTuu2rkjt · B: ses_f06705cefffeo3FMrCdd4o6uVN)**
Target: `src/routes/index.tsx` (app shell + todas as telas). Mode: Operate. Mobile-only, single-user.

## Design Health Score — 26/40

| # | Heurística | Nota | Problema-chave |
|---|-----------|------|----------------|
| 1 | Visibilidade do status | 3 | Contadores/badges ótimos; ação completada some sem transição; editor não reafirma qual pedido |
| 2 | Match com o mundo real | 4 | "Falta cobrar/Falta postar", Pix/Cartão/Dinheiro — vocabulário é o mental da Bia |
| 3 | Controle e liberdade | 2 | Sem undo em ✓ Pago/✓ Enviado; fechar editor descarta sem guard |
| 4 | Consistência e padrões | 3 | Sistema coeso card/chip/sheet; confirm() nativo no restore quebra a linguagem |
| 5 | Prevenção de erros | 2 | Pedido pendente salvo com valor em branco some de toda fila de Pendências |
| 6 | Reconhecimento > memorização | 2 | Grupos "urgente/ligar/ver com bia" dependem de palavras mágicas que a UI nunca ensina |
| 7 | Flexibilidade e eficiência | 2 | Sem repetir pedido, sem marcar vários; form de 10 campos do zero toda vez |
| 8 | Estético e minimalista | 3 | Telas focadas; cancelados/devolvidos encabeçam "60 ativos"; chips zerados na fileira |
| 9 | Recuperação de erros | 2 | Zero validação inline no editor; feedback só em toasts fugazes |
| 10 | Ajuda e documentação | 3 | Sobre é documento de confiança real; sem ajuda contextual para as palavras-chave |

Total 26/40 — band "Acceptable" (melhorias significativas). Máximo aplicável: 40 (todas as heurísticas pontuadas, nenhuma n/a).

## Veredicto de especificidade

A pele é genuinamente autoral (paleta terracota/creme oklch, Fraunces nos numerais de dinheiro, voz de copy da Bia); a arquitetura de interação é estoque (bottom nav + FAB + chips + sheet). A oportunidade mais específica não servida: "Falta cobrar" oferece apenas "✓ Pago" enquanto `waLink()` existe no código — o app modela um negócio que vive no WhatsApp e nunca oferece abrir o WhatsApp. Especificidade mora na paleta, não no comportamento.

## Evidência determinística (Assessment B)

Detector: exit 2, 1 família, 1 finding — `overused-font` (Fraunces) em `src/routes/__root.tsx:91`, warning. Uso curado e intencional (só token `--font-display`, pareado com DM Sans) — tratado como assinatura de marca, não slop. Nenhum outro finding. Overlay de browser: skipped (sem Playwright/ferramenta de automação; fallback = screenshots headless CDP de 6 telas em 390×844 + desktop 1280×900).

## O que está funcionando

1. Pendências é fila de trabalho de verdade: ação primária de um toque por status, contadores vivos, total em R$ por grupo.
2. Tipografia do dinheiro é identidade: Fraunces em todo valor; hero terracota do Resumo é o momento mais autoral.
3. "Nada se perde" é legível: exclusão em duas etapas, motivo de arquivo visível, banner de backup com contagem real, Histórico de alterações por campo no editor.

## Problemas prioritários

1. **[P0] CTA "Registrar pedido" abaixo da dobra no sheet de novo pedido** — Entrega preenche o viewport; Data/Obs/CTA fora da tela; `max-h-[92vh]` exige scroll para completar a ação central. Fix: footer sticky com CTA; colapsar Detalhe/Entrega/Obs atrás de "Mais detalhes"; Cliente, Produto, Qtd/Valor, Status acima da dobra. → `$impeccable distill`
2. **[P1] "Cobrar" sem suporte** — card de "Falta cobrar" só tem "✓ Pago" (screens.tsx:46) apesar de cliente com número salvo e `waLink()` no codebase. Fix: ação primária "Cobrar no WhatsApp" com mensagem pré-preenchida; "✓ Pago" secundária. → `$impeccable shape`
3. **[P1] Sem guard no descarte, sem undo no status** — scrim/X do editor descarta tudo sem confirmar; "✓ Enviado" sem desfazer. Fix: confirm de estado sujo no close + "Desfazer" no toast do sonner. → `$impeccable harden`
4. **[P1] Pedido pendente com valor em branco some da fila** — save valida só cliente/produto (OrderEditor.tsx:33); filtro `o.valor > 0` (screens.tsx:26) esconde o pedido de todo grupo. Fix: avisar no save ou grupo "Sem valor". → `$impeccable harden`
5. **[P2] Restore de backup via confirm() nativo** (screens.tsx:290). Fix: Sheet de confirmação desenhado ("X pedidos atuais serão substituídos pelos Y do backup (backup de dd/mm)"). → `$impeccable clarify`

## Persona red flags

- **Casey (distraída, uma mão):** CTA abaixo da dobra; scrim descarta sem confirmar; chips cortam no meio do glifo ("Entrega u…", "Arquivad…") sem fade; FAB oclui o preço do último card.
- **Alex (power user):** sem repetir último pedido/cliente; datalist nativo único mecanismo de sugestão; marcar 10 pedidos reflui a lista e perde scroll; Revisão enterrada 2 níveis.
- **Sam (acessibilidade):** buscas sem accessible name (screens.tsx:71,103); bottom nav sem aria-current e ativo só por cor (index.tsx:81); Sheet sem role="dialog"/focus trap (ui.tsx:39); chips sem aria-pressed (ui.tsx:8); foco de input sem ring visível (ui.tsx:101).

## Observações menores

- "1 pedidos" no Resumo (pluralização).
- Tab "Mais" usa ícone hamburger — implica drawer, é tab.
- Hero do Resumo responde "de sempre" (R$ 1.116,25), não "como fui no mês".
- Barras do Resumo sem escala/labels — R$ 545 e R$ 571 parecem iguais.
- Branch "Restaurar pedido" (OrderEditor.tsx:102) é código morto — excluídos são inalcançáveis na UI.
- Desktop: coluna max-w-lg centrada, mas nav atravessa o viewport e FAB flutua na borda do viewport — dois sistemas de enquadramento.
- Banner de backup rola para fora junto com o conteúdo.

## Perguntas para considerar

1. Se todo pedido começa no WhatsApp, por que a única affordance de WhatsApp é um ícone pequeno em Clientes — e nenhum na fila "Falta cobrar"?
2. Se a metáfora é caderno, cadê o tique/carimbo/risco a lápis ao marcar "enviado"?
3. O form de 10 campos com CTA sempre à altura do polegar resolveria o custo de entrada?
4. Quando o número mais proeminente vai responder "como fui no mês"?
5. O que faria a Bia *sentir* que o backup era real, além de um toast?
