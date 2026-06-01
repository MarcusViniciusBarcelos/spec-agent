# spec-agent bench — primeiro run (in-environment)

> Método: rodado **dentro de um agente de código** (Claude Code, modelo `haiku`), via subagents. 9 tarefas × 3 condições, N=1. Ground-truth tamper-isolated (`bench/check.js` — o subagent nunca vê o checker). Otimização: o resultado `rules-only` serve de 1ª tentativa do `full-harness` (o gate é aditivo).

| condição | success rate | tokens/tarefa | gate-catch | n |
|---|---|---|---|---|
| baseline | 89% ±31% | 82182 ±19 | 0% | 9 |
| rules-only | 89% ±31% | 82289 ±19 | 0% | 9 |
| full-harness | 100% ±0% | 91438 ±25884 | 11% | 9 |

**Split targeted vs control (success rate):**
- control (3 tarefas triviais): 100% / 100% / 100%
- targeted (5 tarefas com footgun): 80% / 80% / **100%**

## Leitura honesta

- **As regras (prompt) sozinhas não moveram a 1ª tentativa** neste modelo/suite (+0pp, +0,1% tokens). O haiku já resolvia 8/9; só 1 footgun tropeçou (`slug`: colapsou espaços com `\s+` em vez de `\s`).
- **O valor mensurável está no gate**: ele pegou a 1 falha (targeted `slug`) e o fix recuperou → **80%→100% nas targeted** (+11pp no agregado), ao custo de **+11% tokens** (a tarefa pega roda 2×).
- **Controles inalterados** (100% nas 3 condições) — o harness não "ajuda" onde não deve. Isso é o que mostra que o benchmark **não está viciado** a favor do harness.
- **Token dominado por overhead fixo** do agente (~82k base): a adição de prompt do harness é invisível no total; só o fix-loop do gate aparece.

## Ressalvas (o que um run maior mudaria)

- **N=1**: indicativo, não prova. Mais runs dariam variância real.
- **Modelo capaz** (haiku): poucos footguns tropeçaram. Um modelo mais fraco ou tarefas mais difíceis exporiam mais o diferencial das regras.
- A v1 mede o harness no **nível prompt + gate**; a orquestração completa (council multi-agent, skill-forge longitudinal) é v2.

**O entregável real é o método**: um benchmark honesto, reproduzível e tamper-isolated que roda dentro do próprio agente de código — e o primeiro sinal mostra o gate de verificação como o diferencial concreto.
