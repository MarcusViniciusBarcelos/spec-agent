# Regra de Aprendizado por Projeto

INVARIANTE. Aplica-se a todo agent operando em projeto canonico.
Skill operacional: global/skills/project-learning/SKILL.md.

## PL-01 · Captura obrigatoria de sinais de aprendizado

Quando um destes sinais ocorre, o agent DEVE escrever uma entrada
em `projects/<project>/learning/_pending/<categoria>.md`:

| Sinal | Categoria |
|---|---|
| Usuario corrigiu padrao proposto pelo agent | pitfalls |
| Erro cometido pelo agent + correcao na mesma sessao | pitfalls |
| Convencao observada 3+ vezes em arquivos diferentes | conventions |
| Decisao arquitetural nao-obvia validada explicitamente | lessons |
| Termo de dominio clarificado pelo usuario | glossary |
| Padrao de solucao que resolveu problema repetido | patterns |
| Tool retornou erro recorrente com causa comum | pitfalls |

## PL-02 · Consulta obrigatoria antes de acao

Antes destas acoes, o agent DEVE consultar learning/:
- propor padrao novo → consulta patterns.md, conventions.md
- implementar em area conhecida → consulta pitfalls.md
- usar termo de dominio → consulta glossary.md
- decisao estrutural → consulta lessons.md

## PL-03 · INDEX.md sempre carregado

Inicio de sessao em projeto canonico carrega
`projects/<project>/learning/INDEX.md` automaticamente.
Categorias detalhadas sao lidas sob demanda (PL-12 progressive
disclosure).

## PL-04 · Promocao do _pending para duravel

Entrada em `_pending/` promove para duravel quando:
- ocorrencia >=3 vezes em sessoes diferentes (no campo
  `occurrences` da entrada)
- usuario valida explicitamente ("isso vale guardar")
- entrada e de pitfall com correcao pelo usuario (promove imediato)

Promocao move da `_pending/` para o arquivo duravel correspondente
e adiciona linha em INDEX.md.

## PL-05 · Cap de tamanho

- INDEX.md: cap ~80 entradas, 1 linha cada (<=150 chars)
- Cada categoria duravel: top 20 por relevancia
- Acima do cap: revisar, consolidar duplicatas, descartar entradas
  obsoletas

## PL-06 · Nao duplica MEMORY.md global nem napkin

- MEMORY.md global = sobre USUARIO cross-projeto
- napkin = runbook operacional curado por humano
- learning/ = conhecimento tecnico/dominio do PROJETO escrito pelo
  agent

Nao escrever a mesma informacao em dois lugares.

## PL-07 · Aprendizado nao substitui council

Aprendizado informa decisao; council ainda valida. Entrada em
learning/ nao e regra absoluta — e evidencia previa.

## PL-08 · Precedencia em conflito

Em conflito entre fontes, vale:
1. Canonico (manifests, rules, patterns) — sempre prevalece
2. Auto-memory global (sobre o usuario) — para preferencias
   cross-projeto
3. Learning (do projeto ativo) — para conhecimento tecnico do
   projeto
4. Sessions/efemero — nunca prevalece sobre os anteriores

Se learning contradiz canonico: marca entrada como `obsolete`,
remove do duravel.

## PL-09 · Invalidacao de aprendizado

Quando o agent detecta evidencia contraria a entrada existente
(codigo mudou, padrao foi refatorado, convencao evoluiu):
- marca entrada com tag `obsolete` + data
- nao remove imediato (pode ser falso negativo)
- propoe ao usuario no proximo turno relevante
- usuario confirma → remove. Discorda → mantem + documenta razao.

## PL-10 · Sinalizacao da captura

- Escrita em `_pending/`: silenciosa (nao polui resposta)
- Promocao para duravel: 1 linha terse no fim da resposta:
  "[learning] promovido: <entrada curta>"
- Override do usuario ("nao guarda isso"): respeita imediato +
  registra preferencia em auto-memory global

## PL-11 · Privacy controls

Conteudo SENSIVEL nunca vai para learning duravel:
- credenciais, tokens, segredos
- PII especifica (CPF, RG, dados financeiros de cliente real)
- dados de producao real (queries com IDs, nomes pessoais)
- chaves privadas (private_key_*.pem, .env)

Padrao de exclusao: se o conteudo coincide com regra de seguranca
do canonico (HG-01, RF-01), NAO escreve em learning/. Se ja
escreveu, remove na proxima consolidacao.

Override: usuario marca trecho com `<private>conteudo</private>`
para excluir explicitamente.

## PL-12 · 3-layer progressive disclosure

Consulta a learning/ segue 3 camadas, com custo crescente:

| Layer | Conteudo | Custo aproximado |
|---|---|---|
| Layer 1 (INDEX) | Tabela-resumo de todas entradas | ~2k tokens (sempre carregado) |
| Layer 2 (category) | Listagem cronologica de uma categoria | ~3-8k tokens (sob demanda) |
| Layer 3 (entry) | Detalhe completo de uma entrada | ~500-1500 tokens por entrada |

Disciplina:
- comecar SEMPRE pelo Layer 1
- subir para Layer 2 apenas se Layer 1 nao bastar
- subir para Layer 3 apenas para entradas filtradas no Layer 2

Padrao errado (proibido): pular para Layer 3 sem passar pelo INDEX.

## Captura e reativa, nao ciclica

Os triggers de PL-01 disparam captura IMEDIATA em `_pending/`,
independente da fase do fluxo. Nao ha "fase de captura" delimitada.
A consulta (PL-02) e que tem fases definidas (inicio + sob
necessidade).

Sinalizacao ao usuario (PL-10) acontece ao fim do turno, nao no
momento da captura, para nao inflar narrativa.
