---
name: skill-forge
description: Loop governado que transforma gaps de aprendizado recorrentes em skills globais reutilizáveis. Use quando um candidato em skill-candidates.md cruza o threshold no boundary da tarefa, quando o usuário sinaliza "isso devia ser uma skill", ou quando pedem para revisar candidatos a skill. NÃO invocar a cada turno; só no boundary com candidato pronto ou sob pedido explícito.
metadata:
  author: ai-spec
  version: '0.1.0'
---

# skill-forge

Loop governado learn→skill. O gate humano (co-design) + o gate determinístico
(`scripts/skill_candidates.py` + eval do skill-creator) criam o valor — não o gerador.

## Captura (silenciosa)
Ao detectar um dos 4 sinais — pitfall/pattern recorrente (PL-01), routing-miss,
procedimento re-derivado (via claude-mem), ou flag explícito do usuário — registrar/
incrementar um candidato em `projects/<project>/learning/skill-candidates.md` por `pattern-key`.
Silencioso (PL-10).

## Surfacing (boundary + threshold)
No fim da tarefa, para cada candidato `status=open`, checar o gate determinístico:
`python3 scripts/skill_candidates.py meets-threshold --signal <s> --occurrences N --tasks N --days D`.
Se `READY` E passa "é skill mesmo?" (geral, não específico de projeto — senão fica learning)
E não é dedup de skill existente
(`python3 scripts/skill_candidates.py is-duplicate "<desc>" --manifest global/skills/MANIFEST.md`),
disparar **AskUserQuestion**: "Notei [padrão] N×. Vira skill?" → {sim, co-criar / não, fica learning / depois}.
Resposta "não" → `status=rejected` (não re-surfacea).

## Co-design (colaborativo)
Se "sim": propor propósito, escopo, triggers e quando-NÃO-usar; perguntar ao usuário
sobre **regras, recursos, edge-cases e nome**. Capturar o racional DENTRO da skill
(description + when-to-use + constraints) — é o que previne drift.

## Geração
Invocar `skill-creator` para materializar o `SKILL.md` a partir do co-design.

## Gate de verificação (admissão)
1. `skill-creator` eval com/sem-skill em subagent limpo (tamper-isolated; o co-criador não auto-reporta).
2. Fresh-session self-containment: a skill roda em contexto limpo, zero valor de projeto hardcoded.
3. Dedup vs MANIFEST (CLI acima): colisão → merge-ou-justifica.
4. Sem ganho mensurável no benchmark → NÃO admite (presumida errada até medir).
5. Skill substantiva → síntese do `agent-council`.

## Admissão
Registrar em `global/skills/MANIFEST.md` (provenance + SemVer 0.1.0 + when-to-invoke) e
`global/skills/ROUTING.md` (sinal semântico). Marcar o candidato `status=promoted`.

## Deferido (gatilho)
Curadoria/aging/retirement: só com ~10+ skills geradas.
