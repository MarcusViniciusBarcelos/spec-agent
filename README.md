# spec-agent

> Um harness **governado** para o seu agente de código — Claude Code, Copilot, Codex, Cursor. Instalável via `npx`: instala no seu repo uma arquitetura de IA (council, context-economy, project-learning, skill-forge e um **gate de verificação**) e projeta os adapters para cada agente.

[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org)

`spec-agent` não é mais um framework de prompt. É a camada de **governança** que sobra quando o modelo já é capaz: regras que cabem no contexto, um **gate determinístico** que barra o que o modelo não vê, e um **loop de aprendizado** que vira conhecimento durável do projeto. Roda junto do agente de código que você já usa.

---

## Quickstart

```bash
# scaffolda .spec/ + adapters no repo atual
npx spec-agent init --id meu-projeto --agents claude,agents-md

# re-projeta os adapters quando o engine evolui (não toca seu estado durável)
npx spec-agent sync

# adiciona um agente depois do init (re-projeta tudo, preserva seu estado durável)
npx spec-agent sync --agents copilot
```

Pré-requisito: Node ≥ 20.

## Modelo: thin + sync

O **engine** (regras + skills de governança) viaja no pacote. O seu repo recebe só:

- os **adapters** por agente (`CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`) — marcados `GENERATED`, regeneráveis;
- as **skills do engine** no local nativo do agente (`.claude/skills/`) onde houver suporte;
- o **estado durável** do projeto em `.spec/` (`manifest.yaml`, `learning/`, `skills/`).

`sync` re-projeta os adapters a partir do engine atualizado e **nunca** toca `.spec/learning/` nem `.spec/skills/` — seu conhecimento acumulado é seu.

```
seu-repo/
├─ CLAUDE.md                       # adapter GENERATED (Claude Code)
├─ AGENTS.md                       # adapter GENERATED (Codex/genérico)
├─ .github/copilot-instructions.md # adapter GENERATED (Copilot)
├─ .claude/skills/                 # skills do engine, no local nativo do agente
└─ .spec/                          # SEU estado durável (sync nunca toca)
   ├─ manifest.yaml                # id, agentes, loss_report
   ├─ learning/                    # lessons, pitfalls, patterns, glossary, _pending/
   └─ skills/                      # skills geradas pelo skill-forge
```

## Os mecanismos

O harness são cinco peças, cada uma resolvendo uma falha distinta:

| Mecanismo | O que faz | Custo |
|---|---|---|
| **gate de verificação** | Stop-hook determinístico que barra finalizar com lint/typecheck falho no que foi tocado. Pega o erro que o modelo não enxerga sozinho. | barato |
| **skill-forge** | Vira erro recorrente do projeto em skill imperativa reutilizável. Conhecimento durável > memória que o modelo "sabe mas não aplica". | barato |
| **context-economy** | Disciplina de tokens em prompt, tool input e resposta. Grafo de código no lugar de reler arquivos. | barato |
| **project-learning** | Captura sinais de aprendizado em `_pending/` e promove para `learning/`. | barato |
| **agent-council** | Painel multi-persona para decisão ambígua de alto risco. Calibra contra o falso-bloqueio. | seletivo |

## O que medimos

Medimos o diferencial do harness honestamente, com ground-truth objetivo e **tamper-isolated** (o agente nunca vê os checkers). O resultado aponta onde a governança rende de verdade:

- **O gate pega o que o modelo não vê.** Quando uma mudança tropeça numa armadilha, o gate barra e o fix recupera — **recuperação completa nas tarefas-alvo (80%→100%)**. O mecanismo mais barato e o de maior retorno.
- **Conhecimento durável muda o comportamento.** Uma regra do seu projeto, capturada como skill imperativa, faz o agente aplicá-la — onde, sem ela, ele *conhece a regra e ainda assim a viola*. Saber ≠ aplicar.
- **O council calibra o que é ambíguo.** Num painel de perspectivas independentes, decisão de alto risco não é aprovada no susto nem bloqueada por excesso de zelo: **zero falsos-bloqueios** em tradeoffs legítimos, onde um único pass erra para um dos lados.

Métodos, números completos e ressalvas honestas: [RESULTS](./bench/RESULTS.md) · [COUNCIL-RESULTS](./bench/COUNCIL-RESULTS.md) · [SKILLFORGE-RESULTS](./bench/SKILLFORGE-RESULTS.md).

## Funciona com qualquer agente (loss-model honesto)

O harness completo roda no Claude Code; em outros agentes roda **degradado-mas-funcional**, com as perdas registradas explicitamente no `loss_report` do manifest. Ninguém mais formaliza esse loss-model.

| Capacidade | Claude Code | Outros agentes |
|---|---|---|
| multi-agent (council/skill-forge) | nativo (subagents) | simulação single-thread |
| memória cross-sessão | claude-mem (enhancer) | `.spec/learning/` + memória nativa |
| workflows estruturados | superpowers (enhancer) | protocolos inlined |
| economia de tokens | rtk/caveman (enhancer) | disciplina via regra |
| grafo de código | graphify (CLI) | graphify (mesma CLI) |
| gate de verificação | Stop hook | git pre-commit / CI |

Ferramentas específicas de um agente (claude-mem, superpowers, rtk, caveman) são **enhancers opcionais**, não dependências.

## Benchmark

Um micro-benchmark reprodutível mede o diferencial em 3 condições (baseline / rules-only / full-harness) e 3 métricas (success rate, tokens/tarefa, gate-catch). Os checkers de ground-truth são **tamper-isolated**: o agente nunca vê os testes.

O benchmark roda **dentro do seu agente de código**: o agente resolve as tarefas, e os checkers as avaliam fora de banda.

```bash
node bench/score-batch.js solutions.json   # pass-rate; o agente nunca viu os checkers
```

Honestidade: N pequeno (indicativo, não prova estatística); o full-harness **adiciona** tokens (prompt + fix-loop) e as tabelas mostram os dois lados; tarefas e checkers são abertos. A suíte de testes do bench roda com cliente **mockado** (CI-safe).

## Status

**v1** — `init` / `sync` (Claude Code / AGENTS.md / Copilot) + benchmark + landing page. Veja [`examples/hello-project/`](./examples/hello-project/) para uma árvore scaffoldada.

**Roadmap** — Cursor / Codex / Gemini; promoção automática de `_pending` → `learning`; mais controles no benchmark do council.

## Licença

[MIT](./LICENSE) © 2026 Barcelos
