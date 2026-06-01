# Prompt de Bootstrap

Leia o contexto canonico do projeto e o workspace real antes de assumir qualquer coisa.

Passos obrigatorios:

1. identificar o projeto ativo
2. abrir `project.yaml`
3. resolver a precedencia entre `global/` e `projects/<project>/`
4. abrir os entrypoints de contexto e regra relevantes
5. classificar a demanda como backend, frontend, contrato ou cross-stack
6. identificar o papel do agent selecionado e respeitar esse papel antes de agir
7. decidir se existe bloqueio real que exige input do usuario; se nao existir, avancar
8. se houver bloqueio real e a superficie suportar, usar captura estruturada de decisao em vez de pergunta livre/binaria
9. so entao propor especificacao, plano ou implementacao

Regras:

- nao usar `sessions/` como fonte de verdade
- nao inventar regra de negocio fora do contexto canonico
- tratar adapters de vendor como derivados, nunca como origem
- nao deixar entrypoint absorver ownership tecnico de specialist quando houver specialist apropriado no projeto
- nao pausar por confirmacao binaria quando o proximo passo seguro ja puder ser inferido
