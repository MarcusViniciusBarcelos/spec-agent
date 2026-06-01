# Regra de Interacao Estruturada

INVARIANTE. Aplica-se a todo agent, todo projeto e todo adapter
que herde o canonico.

## SI-01 · Avanco por default

Se o proximo passo e seguro, reversivel ou read-only e pode ser
inferido a partir do contexto canonico + workspace real, o agent
DEVE seguir sem esperar confirmacao binaria do usuario.

Exemplos:
- dispatch obvio para specialist ja definido pelo manifesto
- leitura adicional de arquivos para fechar classificacao
- materializacao de artefato explicitamente pedido
- execucao do gate seguinte ja obrigatorio no fluxo

## SI-02 · Pergunta so em bloqueio real

O agent so DEVE pedir input do usuario quando houver bloqueio real:

- acao destrutiva, irreversivel ou com efeito externo relevante
- preferencia de negocio ou trade-off legitimo muda o resultado
- segredo, acesso, aprovacao externa ou dado ausente nao podem ser inferidos
- ambiguidade restante nao pode ser resolvida do canonico/workspace
- usuario pediu explicitamente para pausar ou escolher

## SI-03 · Tool calling + structured outputs por default

Quando a superficie suportar `tool calling` ou `function calling`
com `structured outputs`, o agent DEVE capturar a decisao do
usuario nesse formato, e NAO como pergunta livre em chat.

## SI-04 · Schema minimo da decisao

Toda captura estruturada de decisao deve incluir, no minimo:

- `decision_id`
- `question`
- `why_needed`
- `recommended_option`
- `options[]` com `id`, `label`, `description`
- `allow_custom_text: true`
- `custom_text_label`

Campos opcionais:

- `default_if_no_response`
- `risk_if_wrong_choice`
- `deadline_hint`

## SI-05 · Opcao recomendada obrigatoria

O agent DEVE calcular a melhor proxima acao e marca-la como
recomendada. Ele nao pode terceirizar ao usuario uma triagem que o
manifesto, o papel selecionado, o council ou o workspace ja
resolvem.

Pergunta proibida:
- "como quer seguir?" quando o proximo gate ja esta definido
- "quer que eu continue?" quando a continuacao segura e obvia

## SI-06 · Binario e excecao, nao default

Perguntas binarias (`sim/nao`, `segue/nao segue`) sao proibidas por
default.

So sao aceitaveis quando a decisao for genuinamente booleana, como:

- aprovar acao destrutiva
- autorizar operacao externa irreversivel
- confirmar preferencia pessoal sem alternativas reais

Se houver 2+ caminhos validos, o correto e lista estruturada de
opcoes + campo customizado, nao binario.

## SI-07 · Maximo de opcoes

- usar ate 3 opcoes mutuamente exclusivas
- listar a recomendada primeiro
- cada opcao deve dizer impacto/trade-off em 1 frase
- sempre permitir texto livre customizado quando a superficie suportar

## SI-08 · Fallback sem structured outputs

Se a superficie nao suportar `tool calling` ou `structured
outputs`, o agent DEVE emular a captura com bloco compacto e
estruturado:

    Decisao necessaria: <question>
    Recomendado: <opcao>
    Opcoes:
    1. <label> — <impacto>
    2. <label> — <impacto>
    Customizado: <texto livre>

Mesmo no fallback, vale SI-01: nao perguntar se o proximo passo ja
for inferivel.

## SI-09 · Aprendizado da escolha

Quando o usuario repetir a mesma preferencia ou corrigir o mesmo
padrao de interacao em sessoes distintas:

- preferencia cross-projeto -> auto-memory global
- heuristica de fluxo do projeto -> `learning/_pending/`

## Relacao com a triade

- `agent-council` decide se ha bloqueio real ou se o fluxo pode seguir
- `context-economy` impede perguntas redundantes e longas
- `project-learning` evita re-perguntar o que ja foi estabilizado
