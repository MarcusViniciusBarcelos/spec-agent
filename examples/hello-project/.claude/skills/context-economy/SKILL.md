---
name: context-economy
description: Economia de contexto e reducao de tokens preservando
  qualidade semantica. Mandataria ao lado de agent-council e
  project-learning. Aplica-se a todo arquetipo, antes do trabalho.
  Implementa caveman speak, rtk filtering e context-mode
  Think-in-Code via prompt-only.
type: governance
mandatory: true
---

# Skill: Context Economy

## Quando invocar

Antes de QUALQUER trabalho terminal, em qualquer arquetipo. E
skill mandataria de governanca junto com agent-council e
project-learning. Roda na fase de planejamento, apos consulta de
learning.

## Protocolo (checklist obrigatorio)

1. Identificar tipos de output que serao produzidos
2. Aplicar tabela de compressao por tipo de bloco (sub-protocolo 1)
3. Identificar comandos shell a executar e aplicar flags
   compressivas (sub-protocolo 3)
4. Identificar leituras de arquivo: se 3+, usar Think-in-Code
   (sub-protocolo 4)
5. Identificar pressao de contexto (>70% → modo defensivo, sub-
   protocolo 8)
6. Identificar tools independentes a chamar → batch em paralelo
   (sub-protocolo 13)
7. Decidir subagent dispatch para investigacoes volumosas
   (sub-protocolo 6)
8. Reconhecer override explicito do usuario e suspender modo terse
   (sub-protocolo 9)
9. Antes de Read em arquivo do projeto, tentar `graphify query` se
   `graphify-out/` existir (RC-13, sub-protocolo 14)

## Sub-protocolo 1: Tabela de Compressao por Tipo de Bloco

| Tipo | Modo | Justificativa |
|---|---|---|
| Narrativa intermediaria | TERSE | Sem valor semantico |
| Status update entre tools | TERSE | Implicito no fluxo |
| Explicacao redundante com codigo | TERSE | Codigo fala por si |
| Resposta a pergunta casual | TERSE | Conversa direta |
| Header de council (5 secoes) | FORMAL | Invariante canonico |
| spec.md / plan.md / tasks.md | FORMAL | Artefato duravel |
| ADR / RFC | FORMAL | Decisao duradoura |
| Change report final | FORMAL | Handoff |
| Comentario PT-BR de codigo | FORMAL | Hard rule HG-03 |
| Mensagem de commit | FORMAL | Auditoria |
| Output de validacao | FORMAL | Cru, sem reescrita |
| Codigo | NUNCA TOCA | Inviolavel |
| Warning de seguranca | EXPANDE | Auto-expand RC-02 |
| Acao destrutiva | EXPANDE | Auto-expand RC-02 |

## Sub-protocolo 2: Glossario caveman speak (antes/depois)

| Antes (verbose) | Depois (terse) |
|---|---|
| "Eu vou comecar lendo o arquivo X..." | "Lendo X." |
| "Como voce pode ver na linha 42..." | "Linha 42: funcao X." |
| "E importante notar que..." | (corta) |
| "Basicamente o que esta acontecendo..." | (corta) |
| "Para resolver esse problema, sugiro..." | "Solucao:" |
| "Espero que isso ajude!" | (corta) |
| "Voce gostaria que eu..." | "Sigo? Quer que eu..." |
| "Existem varias formas, mas..." | "X: A, B, C. Pego A?" |

## Sub-protocolo 3: Tabela de Comandos Compressivos

| Padrao | Compressivo | Reducao |
|---|---|---|
| `git status` | `git status -s` | ~80% |
| `git log` | `git log --oneline -N` | ~80% |
| `git diff` | `git diff --stat` antes de full | ~70% |
| `find . -name X` | `find . -name X \| head -N` | depende |
| `grep -r "X"` | `grep -rl "X"` | ~70% |
| `ls -la` | `ls` ou `ls -1` | ~50% |
| `pytest` | `pytest -q --tb=short` | ~85% |
| `jest` | `jest --silent` | ~80% |
| `cargo test` | `cargo test --quiet` | ~70% |
| `tsc` | `tsc --noEmit 2>&1 \| head -50` | depende |
| `npm install` | `npm install \| tail -3` | ~95% |
| `docker ps` | `docker ps --format "{{.Names}} {{.Status}}"` | ~75% |
| `cat <grande>` | `head -50 file && tail -20 file` | depende |

## Sub-protocolo 4: Patterns Think-in-Code

Antes (proibido):
- ler 20 arquivos via Read tool para contar funcoes

Depois (correto):

    python -c "
    from pathlib import Path
    import re
    total = sum(len(re.findall(r'def \w+', p.read_text()))
                for p in Path('app/models').glob('*.py'))
    print(f'Total functions: {total}')
    "

Quando aplicar: 3+ arquivos para extrair dado estruturado.
Linguagens preferidas: Bash + awk/jq, Python one-liner, Node
one-liner.

## Sub-protocolo 5: Sandbox via redirecionamento

Comando que produz >500 linhas:

    comando_verboso > /tmp/<descritor>.log 2>&1
    wc -l /tmp/<descritor>.log
    head -30 /tmp/<descritor>.log
    grep "ERROR\|FAIL" /tmp/<descritor>.log | head -10

## Sub-protocolo 6: Decisao de Subagent

Threshold: investigacao que produziria >2k tokens de exploracao
para entregar <500 tokens de conclusao.

Para subagent:
- mapear todos endpoints que tocam tabela X
- listar arquivos que dependem de funcao Y
- contar testes por modulo
- buscar padroes de codigo duplicado

NAO para subagent:
- ler 1 arquivo especifico
- editar codigo (subagent nao recebe contexto suficiente)
- decisao de arquitetura

Prompt de subagent obrigatorio:
- "report under N words" (200-500)
- "no preamble, no closing pleasantries"
- "structured output: <formato esperado>"

## Sub-protocolo 7: Auto-expand triggers

Expande quando a SAIDA propoe acao com risco real:
- propor mudanca em codigo de auth/JWT/segredo → expande
- explicar como auth funciona em discussao tecnica → terse
- propor migration que altera tabela de PII → expande
- referenciar tabela de PII numa exploracao → terse

Regra mental: "minha resposta vai PRODUZIR risco de seguranca ou
acao destrutiva?" Sim → expande. Nao → terse.

## Sub-protocolo 8: Modo defensivo de pressao de contexto (RC-09)

Quando contexto >70%:
- nao rele arquivos ja investigados
- sumariza progresso em memory/ ou learning/_pending/ antes do
  auto-compact
- prefere subagent dispatch
- consulta usuario antes de iniciar polo novo

## Sub-protocolo 9: Override explicito

Quando usuario explicitamente pede formal/detalhado, suspender
modo terse pela duracao da resposta. Nao desativa auto-expand
(seguranca/destrutivo continuam expandindo).

## Sub-protocolo 10: Limite de leitura simultanea (RC-06)

Nao ler mais que 5 arquivos antes de agregar. Acima disso, pular
para Think-in-Code (sub-protocolo 4).

## Sub-protocolo 11: Memoria como cache de contexto (RC-07)

Antes de qualquer Read/Grep:
1. Verificar se o arquivo/simbolo ja foi investigado nesta sessao
2. Verificar se ha entrada relevante em learning/INDEX.md
3. So ler do disco se ambos vazios

## Sub-protocolo 12: Concisao em tool inputs (RC-10)

- WebSearch: "termos exatos query", nao "encontre informacoes
  sobre"
- Subagent prompt: contexto necessario + alvo especifico, NUNCA
  recapitulacao da conversa
- Bash: comando direto + flags compressivas
- Read: offset+limit quando souber a linha aproximada, nao Read
  completo

## Sub-protocolo 13: Paralelizacao de tools (RC-12)

Se vai chamar N tools sem dependencia:
- Listar mentalmente as dependencias
- Tools sem dependencia → emitir TODAS na mesma resposta
- Sequencial so quando A precisa do resultado de B

## Sub-protocolo 14: Graphify-first (RC-13)

Antes de Read em arquivo do projeto, verificar se existe
`graphify-out/graph.json` na raiz do projeto e tentar query no
grafo:

```
graphify query "<pergunta>" --graph graphify-out/graph.json
graphify path "<A>" "<B>" --graph graphify-out/graph.json
graphify explain "<X>" --graph graphify-out/graph.json
```

Decisao:
- query retornou suficiente → continuar sem Read
- query insuficiente → Read no arquivo especifico apontado pelo
  grafo (nao todo o diretorio)
- query falhou (grafo nao existe ou esta corrompido) → Read normal
  e sinalizar ao usuario que o grafo precisa ser construido/
  atualizado: `graphify update <projeto>`

Read sem checagem do grafo so e aceitavel quando:
- usuario pediu explicito ("leia o arquivo X", "veja o codigo bruto")
- arquivo e binario, imagem ou nao indexado pelo grafo
- arquivo acabou de ser criado nesta sessao (ainda nao indexado)

Atualizacao incremental: apos mudancas relevantes em codigo, rodar
`graphify update <projeto>` para reindexar (rapido, sem LLM).

## Heuristica de tamanho

| Bloco | Tamanho-alvo |
|---|---|
| Antes de tool call | <=1 linha ("Lendo X.") |
| Status update entre tools | <=1 linha ou omitir |
| Resposta a pergunta casual | <=3 linhas |
| Descricao de mudanca feita | 1-2 frases |
| Header de council | 1 linha por secao (formal mas curto) |
| Resposta a "como funciona X?" | 3-6 linhas, sem hedging |

Acima do alvo e sinal de fluff. Re-comprimir antes de emitir.

## Saida terminal desta skill

A skill em si NAO produz saida terminal de conteudo. Ela e
acionada implicitamente para condicionar o comportamento de toda
saida do agent. O council (agent-council) continua sendo o
chairman da saida terminal.

## Alinhamento com council e learning

- Council preserva qualidade semantica (RC-08)
- Esta skill preserva custo de contexto
- Project-learning preserva conhecimento duravel
- As tres sao duais e complementares — nunca conflitam
- Headers de council ficam SEMPRE formais; resto pode ser terse
