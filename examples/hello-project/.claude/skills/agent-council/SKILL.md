---
name: agent-council
description: Council-first governance skill for the canonical AI architecture. Council runs in the PLANNING phase (task-writer / specify / plan / tasks), NOT on every execution turn. Six independent personas deliberate once, then execution agents receive the validated package. Execution turns invoke council only as exception (cross_stack, contract change, security surface, repeated failure). Use this skill when planning a non-trivial task; do not invoke per-turn during execution.
metadata:
  author: ai-spec
  version: '2.0.0'
  inspiration:
    - https://github.com/hex/claude-council
    - https://github.com/karpathy/llm-council
    - "5-personas pattern: contrarian / first-principles / expansionist / outsider / executor"
---

# Agent Council

Skill canonica de governanca `council-first` do canonico.

Versao 2.0: council na FASE de planejamento, nao a cada turno.

## Mudanca v1 → v2

| Aspecto | v1 (descontinuado) | v2 (canonico) |
|---|---|---|
| Quando rodar | toda saida terminal | apenas planning + execucao excepcional |
| Perspectivas | 3 (execucao/arquitetura/risco) | 6 personas independentes |
| Headers terminais | toda resposta | apenas fechamento de marco ou escalada deep |
| Custo de tokens | ~150-250 overhead/turno | overhead concentrado em 1 fase |

## Quando invocar

### OBRIGATORIO

- Fase de planejamento (`task-writer`, `document_writer` em `specify`/`plan`/`tasks`)
- Qualquer decisao estrutural antes de codar (novo modulo, contrato, migracao)
- Aprovacao de RFC/ADR
- Antes de dispatch de subagent que vai executar trabalho substantivo

### EXCECAO em execucao

Invocar council apenas quando o agent de execucao detectar:
- impacto `cross_stack` nao previsto no plano
- mudanca de contrato que o plano nao cobriu
- superficie de seguranca relevante (auth, PII, segredo) nao mapeada
- falha repetida da mesma estrategia (3+ tentativas)
- desacordo material com o plano recebido

### NAO invocar

- turno intermediario de execucao seguindo plan/tasks aprovados
- resposta a pergunta tecnica direta
- status update / progresso
- correcao mecanica orientada por validacao (mypy, lint, tests)
- consulta de arquivo / busca / leitura

## Personas (6 independentes)

Cada persona produz um output estruturado e curto. Sem prosa.
Personas NAO conversam entre si na deliberacao — cada uma fala uma vez.
A sintese cabe ao `chairman`.

### 1. `executor`

Foco: acao imediata. So se importa com o que precisa ser feito JA.
Pergunta-base: "qual e o menor patch que entrega valor?"
Vies: prefere KISS, descarta over-engineering.
Anti-vies: pode ignorar risco estrutural. Compensado por `contrario` e `arquitetura_contrato`.

### 2. `arquitetura_contrato`

Foco: contratos e fronteiras. Preserva interfaces publicas, contratos HTTP,
schemas, eventos.
Pergunta-base: "que contrato esta exposto e como nao quebra-lo?"
Vies: pode resistir a mudanca necessaria. Compensado por `pensador_primeiros_principios`.

### 3. `contrario`

Foco: o que pode dar errado. Race condition, edge case, falha em escala,
regressao em fluxo nao testado, dependencia oculta, falha silenciosa.
Pergunta-base: "como isso quebra em producao?"
Vies: pode bloquear sem necessidade. Compensado por `executor` e `expansionista`.

### 4. `pensador_primeiros_principios`

Foco: ignora a solucao proposta e reconstroi do zero a partir do problema.
Pergunta-base: "se eu tivesse que resolver isso sem nada do que ja existe,
como faria?"
Vies: pode descartar contexto valido. Compensado por `arquitetura_contrato`.

### 5. `expansionista`

Foco: oportunidades adjacentes que o plano nao viu — refatoracao incidental
de baixo custo, sinergia com modulo ja existente, ganho de observabilidade
free, abstracao reutilizavel.
Pergunta-base: "o que mais essa mudanca destrava com baixo custo?"
Vies: pode inflar escopo. Compensado por `executor`.

### 6. `outsider`

Foco: analise neutra do problema. NAO recebe o bootstrap do projeto, NAO
le `learning/`, NAO le contexto do polo. Recebe SO o texto do pedido +
constraints universais (nao-quebrar-producao, seguranca basica).
Pergunta-base: "olhando so o problema descrito, sem viés do projeto,
qual e a abordagem mais simples?"
Vies: ignora idiossincrasias do projeto. Compensado pelas outras 5.

## Modos

| Modo | Personas usadas | Profundidade | Quando |
|---|---|---|---|
| `compressed` | 3 (executor + contrario + arquitetura) | resposta de 1 linha por persona | tarefa pequena/mecanica em planning |
| `standard` | 6 personas completas | resposta de 2-3 frases por persona | maioria das tarefas em planning |
| `deep` | 6 + segunda rodada de reconciliacao | debate aprofundado pos-divergencia | escalada (cross_stack, contrato, seguranca, falha repetida) |

## Workflow (planning)

1. Chairman recebe o pedido + bootstrap do projeto
2. Define modo (`compressed` / `standard` / `deep`)
3. Coleta as N personas em paralelo (modo: standard=6, compressed=3)
   - cada persona produz output independente, curto, estruturado
   - `outsider` recebe payload limpo (so o problema)
4. Chairman sintetiza: convergencias, divergencias, riscos
5. Decide proximo passo: dispatch, aprofundamento, bloqueio
6. Saida terminal com 5 headers obrigatorios

## Workflow (execucao excepcional)

1. Agent de execucao detecta sinal de escalada
2. Para a execucao no ponto seguro
3. Roda council `compressed` ou `standard` conforme severidade
4. Aplica decisao do council ou devolve ao planning
5. Retoma execucao com plano ajustado
6. Saida terminal com 5 headers (escalada e fechamento implicito)

## Sinais de escalonamento para `deep`

- decisao arquitetural ou trade-off estrutural
- impacto `cross_stack`
- contrato novo ou alterado
- trust boundary, auth, PII, segredo, compliance ou superficie de seguranca relevante
- falha repetida, rework recorrente ou discordancia material entre personas

## Saida terminal (5 headers)

Obrigatoria APENAS em:
- fim de planning (handoff para execucao)
- escalada deep durante execucao
- fechamento final de marco (ultima resposta da tarefa)
- override explicito do usuario ("formal", "council completo")

NAO obrigatoria em:
- turnos intermediarios de execucao
- respostas a perguntas tecnicas diretas
- status updates

Formato:

- `Consenso:` — o que todas as personas concordam
- `Divergencias:` — onde N personas discordam (cita persona + posicao)
- `Recomendacao:` — sintese acionavel do chairman
- `Riscos residuais:` — o que `contrario` levantou e nao foi mitigado
- `Proximo passo:` — gate, dispatch, ou acao concreta

## Compatibilidade com perspectivas v1

As 3 perspectivas antigas mapeiam para 3 das 6 personas:

| v1 | v2 |
|---|---|
| `execucao_entrega` | `executor` (mesma funcao, rename) |
| `risco_review` | `contrario` (mesma funcao, rename) |
| `arquitetura_contrato` | `arquitetura_contrato` (mantido) |

Personas adicionais em v2: `pensador_primeiros_principios`, `expansionista`, `outsider`.

## Surface adapters

Quando a superficie nao suporta multi-agent real (Copilot, Cursor sem
multi-thread), o council e simulado de forma sequencial:
- chairman emite N prompts curtos para si mesmo, um por persona
- cada prompt forca o vies da persona ("voce e o contrario")
- chairman compila a sintese
- perda registrada: `single-thread simulation` no loss model

## Integracao com outras skills

- `context-economy` → council e excecao a RC-01 (compressao). Os 5
  headers ficam intactos (RC-08).
- `project-learning` → personas podem consultar learning/ (excecao:
  `outsider` nao consulta). Sintese pode promover entradas para
  duravel via PL-04.
- `ROUTING.md` → council e disparado em planning, nao a cada
  arquetipo. Triagem de skills do arquetipo roda APOS sintese do
  council.
