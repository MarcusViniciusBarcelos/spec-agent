# Regras de Implementacao

- Implementar apenas depois de validar escopo e fontes de verdade.
- Nao editar manualmente artefatos gerados.
- Preservar convencoes e padroes reais do repositorio.
- Preferir mudancas incrementais e verificaveis.
- Antes de editar funcao, modulo ou fluxo ja existente e validado, executar analise de impacto local e adjacente para reduzir side effects e regressao.
- Identificar explicitamente o que deve permanecer intacto: comportamento observado, contratos, consumidores, side effects esperados, edge cases e validacoes adjacentes de maior risco.
- Quando o contrato mudar, atualizar seus derivados antes de concluir o trabalho.
- Validar ao menos o lado afetado; em mudancas cross-stack, validar ambos os polos aplicaveis.
- Toda mudanca em comportamento existente deve validar o fluxo alterado, os side effects esperados e os comportamentos adjacentes mais sensiveis antes de concluir.
- Quando o pack SDD definir smoke path, cobertura de regressao dedicada ou shape canonico de auditoria, a implementacao deve trata-los como obrigatorios e nao como sugestao editorial.
- Quando o plano apontar degradacao graceful, comportamento preservado ou suporte parcial por integracao, a implementacao deve validar explicitamente esses ramos antes de concluir.
- Quando o pack definir backlog e plano de execucao de testes, a implementacao deve separar claramente: escrita dos testes, execucao dos testes e correcao dos bugs encontrados, com reexecucao ao final.
- Cobertura util vale mais que volume: nao encerrar trabalho com suites triviais que inflen porcentagem mas deixem sem protecao regras de negocio, falhas provaveis ou fluxos criticos.
- Em fluxos async, concorrentes, multi-step, transacionais ou dependentes de estado, a implementacao deve priorizar primeiro os testes e validacoes de maior risco.
- Se a cobertura completa nao for viavel, registrar explicitamente o que ficou sem validacao e qual risco residual permanece.
- Sessions e material de scratch nunca substituem contexto canonico.
