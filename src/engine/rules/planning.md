# Regras de Planejamento

- Nao planejar antes de ler as fontes de verdade do escopo afetado.
- Toda demanda deve ser classificada como backend, frontend, contrato ou cross-stack.
- Em mudancas cross-stack, o contrato deve ser identificado explicitamente.
- Toda demanda que toque funcao, modulo ou fluxo ja existente e validado deve comecar por analise de impacto anti-side-effects.
- A analise deve mapear comportamento atual preservado, chamadores e consumidores, entradas e saidas, permissoes, estados e transicoes, side effects persistentes e assincronos, caches, retries, artefatos derivados e observabilidade quando aplicavel.
- O plano deve priorizar o menor conjunto de mudancas suficiente.
- O plano deve separar fonte de verdade de artefato derivado.
- O plano deve listar riscos de breaking change, idempotencia, concorrencia, estados assincronos e observabilidade quando relevantes.
- O plano e o pack SDD devem registrar comportamentos adjacentes sensiveis, edge cases, riscos de regressao e cobertura minima de validacao para reduzir side effects inesperados.
- Quando a demanda exigir pack SDD completo, o plano deve garantir RFs e RNFs atomicos o suficiente para implementacao e QA, sem comprimir validacoes distintas ou side effects relevantes no mesmo requisito generico.
- Quando historico, auditoria ou snapshot forem afetados, o plano deve exigir shape canonico unico para esses dados antes de concluir o pack.
- Quando integracoes, bancos, providers ou consumidores tiverem comportamentos diferentes para a mesma feature, o plano deve exigir matriz explicita de suporte e degradacao em vez de texto implicito.
- Em bug, feature, spec ou analise que toque acoes, execucoes, fluxos existentes, integracoes, contratos, estado, concorrencia ou side effects, a analise de testabilidade e cobertura util e obrigatoria.
- A analise de testabilidade deve priorizar risco de regressao, regras de negocio, branches criticos, falhas provaveis, idempotencia, retry/timeout/backoff, concorrencia, serializacao, permissoes e efeitos colaterais em vez de perseguir porcentagem cosmetica.
- O planejamento deve diferenciar claramente backlog de testes unitarios, de integracao, de contrato e end-to-end quando esses niveis fizerem sentido para o fluxo.
- O pack deve registrar gaps de testabilidade e refactors minimos sem breaking change quando houver codigo dificil de validar com confianca.
- Se a ambiguidade bloquear execucao segura, `clarify` vem antes do plano detalhado.
- Se a superficie de impacto ou regressao nao estiver clara, o plano nao pode seguir como seguro; aprofundar analise vem antes do handoff.
