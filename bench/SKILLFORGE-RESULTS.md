# skill-forge bench — reuso longitudinal (in-environment)

> Método: dentro de um agente de código (Claude Code, `haiku`), subagents isolados sem ferramentas. Testa se uma skill **gerada pelo skill-forge** (heurísticas de review aprendidas do histórico de um projeto) melhora tarefas seguintes vs não tê-la em contexto. Subagent sem tools = teste limpo de injeção de conhecimento (a condição "sem skill" não pode "descobrir" o invariante grepando o codebase).
>
> As tarefas abaixo são **anonimizadas**: a skill real foi gerada a partir de um projeto privado; aqui descrevemos só a *forma* da heurística, não o código-fonte do projeto.

## A pergunta

Conhecimento durável capturado numa skill paga reuso? Onde — e onde é só shadowing (o modelo já sabia)?

## Suite — 3 tarefas × 2 condições (sem skill / com skill)

| # | tarefa | heurística | tipo |
|---|---|---|---|
| L1 | revisar um PR que move uma chamada de publish de evento de DENTRO da transação para DEPOIS do commit | invariante de framework: o publish **já** é diferido pro pós-commit | onde a resposta óbvia engana |
| L2 | ler um campo de um DTO tipado (cliente gerado) que chegou em snake_case num ambiente | convenção: responses em camelCase; corrigir o tipo na origem, **não** usar fallback | convenção do projeto |
| L3 | escrever `debounce(fn, ms)` | nenhuma (controle) | conhecimento geral |

## Resultado

| tarefa | sem skill | com skill | diferencial |
|---|---|---|---|
| **L2 (casing)** | adicionou fallback defensivo `?? campo_snake` (errado) — *citou a regra e violou mesmo assim* | leu o campo em camelCase puro, corrige na origem (certo) | **flip limpo** ✅ |
| **L1 (publish-in-tx)** | REJEITOU pelo motivo errado → recomendou implementar outbox (trabalho desnecessário) | REJEITOU: "o framework já difere o publish, não refatore" (certo) | suave — evitou over-engineering, não flipou veredito |
| **L3 debounce** | correto | correto (idêntico) | **nenhum** ✅ (sem viés) |

## Leitura honesta

- **L2 é o ganho forte e o mais instrutivo**: o modelo base *sabia* a regra (chegou a citar uma memória anterior do mesmo conteúdo) e mesmo assim racionalizou o fallback "defensivo". A skill, em forma **imperativa/checklist** ("NÃO usar fallback; corrigir na origem"), barrou a racionalização que a memória verbosa não barrou. **Forma da skill > existência da regra.** Conhecimento disponível ≠ conhecimento aplicado.
- **L1 mostra o tipo certo de conhecimento**: o invariante (um framework que já coleta o publish e faz o flush DEPOIS do commit) é project-specific e o modelo base não tem como saber — sem a skill ele propõe outbox (engenharia desnecessária). Mas o *veredito* não flipou (ambos rejeitaram o PR), então o ganho é "rationale correto / evita trabalho à toa", não "evita bug".
- **L3 controle limpo**: skill irrelevante → zero efeito. Confirma que o ganho de L1/L2 é da heurística certa, não de "a skill deixa o agente genericamente mais cuidadoso".

## Conclusão

Reuso de skill paga em **conhecimento project-specific que o modelo aplica errado sozinho** — especialmente convenções onde o default plausível viola a regra (L2). É **barato** (a skill entra no contexto via o sistema de skills do agente, custo marginal) e **localizado**. Diferente do council (5× tokens, ganho marginal de calibração): a skill-forge é o lado **barato e durável** do harness. Ressalva: n=1 por tarefa; o que vale é o padrão (flip em convenção, neutro em controle), não a taxa.
