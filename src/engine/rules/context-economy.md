# Regra de Economia de Contexto

INVARIANTE. Aplica-se a todo agent, todo arquetipo, todo vendor,
todo projeto que herde o canonico. Skill operacional:
global/skills/context-economy/SKILL.md.

## RC-01 · Compressao segmentada obrigatoria

Comprime AGRESSIVAMENTE (estilo terse/caveman):
- narrativa intermediaria ("vou ler", "agora vou", "deixa eu")
- explicacoes conceituais redundantes com o proprio codigo
- status updates entre tool calls
- respostas a perguntas casuais
- descricoes de arquivos/diretorios ja listados
- justificativas obvias

NAO comprime (formal preservado):
- headers obrigatorios do council (consenso, divergencias,
  recomendacao, riscos_residuais, proximo_passo)
- conteudo de spec.md, plan.md, tasks.md, ADRs, RFCs
- change reports finais quando exigidos pelo manifesto
- comentarios PT-BR de codigo (HG-03)
- mensagens de commit
- output de validacao (evidencia crua)
- codigo (NUNCA toca codigo)

## RC-02 · Auto-expansao obrigatoria

EXPANDE para texto completo, mesmo dentro de modo terse, em:
- warnings de seguranca (auth, PII, segredo, dado financeiro)
- acoes destrutivas ou irreversiveis (DROP, rm -rf, force push,
  delete em massa, alteracao de contrato publico)
- confusao detectada do usuario (perguntas repetidas, sinais de
  desentendimento)
- override explicito do usuario ("formal", "completo", "detalhado",
  "explica tudo", "sem caveman")

Auto-expand e por CONSEQUENCIA da saida (vai produzir risco real?),
nao por palavra mencionada (auth/JWT em discussao tecnica neutra
nao expande).

## RC-03 · Filtragem de comando antes de leitura

Comandos verbosos DEVEM usar flags compressivas como default:
- `git status` → `git status -s`
- `git log` → `git log --oneline -N`
- `git diff` → `git diff --stat` antes de full
- `find` → sempre com `| head -N` quando exploratorio
- `grep -r` → `grep -rl` (so nomes) antes de full
- `ls -la` → `ls` ou `ls -1`
- testes → modo compacto (`pytest -q --tb=short`, `jest --silent`)
- builds → erros so (`tsc --noEmit 2>&1 | head -50`)
- npm install → `npm install | tail -3`

## RC-04 · Think-in-Code obrigatorio acima de threshold

Tarefa que exige leitura de 3+ arquivos para extrair dado
estruturado (contagem, listagem, agregacao, padrao) DEVE usar
script (Bash, Python, awk, jq) que processa e imprime APENAS o
resultado agregado.

Exemplo proibido: ler 20 arquivos via Read tool para contar funcoes
Exemplo correto: gerar script que le os 20 e imprime so a contagem

## RC-05 · Sandbox via redirecionamento de output

Comando que produz >500 linhas DEVE redirecionar para arquivo e
ler so resumo:
- `comando > /tmp/<nome>.log 2>&1 && wc -l /tmp/<nome>.log`
- depois `head -N`, `tail -N`, ou `grep <padrao>`

## RC-06 · Limite de leitura simultanea

Nao ler mais de 5 arquivos em uma sequencia sem agregar.
Se a tarefa exigir mais, RC-04 (Think-in-Code) substitui.

## RC-07 · Memoria persistente como cache de contexto

Se o agent ja investigou um arquivo/simbolo na sessao atual, NAO
rele. Se ja registrou em memory/ ou learning/, consulta primeiro
antes de reler do disco.

## RC-08 · Council preservado

A compressao NUNCA pode degradar o council. Os 5 headers ficam
intactos como invariante semantico, conforme loss_model declarado
em adapters-operational-spec.md.

## RC-09 · Pressao de contexto

Quando o contexto ultrapassa ~70% da janela, ativar modo defensivo:
- parar de reler arquivos ja investigados
- sumarizar progresso atual em memory/ ou learning/_pending/ antes
  que auto-compact destrua decisoes
- preferir subagent dispatch para investigacoes futuras
- consultar usuario antes de iniciar exploracao de novo polo

## RC-10 · Concisao em tool inputs

Inputs de tool seguem mesma disciplina de compressao:
- queries de busca: termos exatos, sem prosa
- prompts de subagent: contexto necessario e suficiente, NUNCA
  history dump
- comandos shell: flags minimas que produzem o resultado
- Read: usar offset+limit quando souber a linha aproximada,
  nao Read completo

## RC-11 · Subagent como economia de contexto

Investigacao que produziria 5+ tool calls + leituras volumosas e
cuja saida util e uma sintese curta DEVE ser delegada a subagent.

Threshold: investigacao que produziria >2k tokens de exploracao
para entregar <500 tokens de conclusao.

Prompt de subagent DEVE incluir:
- "report under N words" (200-500, conforme escopo)
- "no preamble, no closing pleasantries"
- "structured output: <formato esperado>"

## RC-12 · Paralelizacao de tools independentes

Multiplas tool calls sem dependencia entre si DEVEM rodar em
paralelo na mesma resposta. Sequencial so quando uma depende do
resultado da outra.

## RC-13 · Graphify-first para entender codigo/docs do projeto

INVARIANTE vendor-neutral. A CLI `graphify` funciona em qualquer
ambiente com Python e shell — nao depende de skill system de
vendor especifico. Cada adapter (Claude Code, Copilot, Codex,
Cursor, Gemini, etc) projeta a invocacao apropriada para sua
superficie, mas a obrigacao do agent e a mesma.

Antes de Read em arquivo do projeto, o agent DEVE tentar primeiro:

- `graphify query "<pergunta>" --graph graphify-out/graph.json`
- `graphify path "A" "B"` para relacao entre conceitos
- `graphify explain "X"` para descricao de no e vizinhos

Read no arquivo bruto so e permitido quando:
- a query do grafo for insuficiente (e o agent declara isso)
- o usuario pedir explicito ("leia o arquivo", "veja o codigo bruto")
- o arquivo nao estiver no escopo de extracao (imagem, binario)
- `graphify-out/` nao existir ainda no projeto

Quando `graphify-out/` existir mas estiver desatualizado (sinal:
arquivo recente + grafo antigo), o agent DEVE rodar
`graphify update <path>` antes de assumir resposta da query.

Threshold: projeto com 10+ arquivos de codigo/docs DEVE ter grafo.
Projeto pequeno (<10 arquivos) pode operar sem grafo.

Convivencia: graphify cobre ESTRUTURA; claude-mem cobre MEMORIA
cross-sessao; project-learning cobre APRENDIZADO duravel. Cada
camada e independente, sem redundancia.

`graphify-out/` deve estar em `.gitignore` em todo projeto.

Disciplina de adapter: cada projecao DEVE incluir bloco
"Navegacao de Contexto (graphify-first)" explicito apontando para
a CLI. Paths obrigatorios por vendor:

| Vendor | Path do adapter |
|---|---|
| Claude Code | `<repo>/CLAUDE.md` ou `<workspace>/CLAUDE.md` |
| GitHub Copilot (VSCode) | **`<repo>/.github/copilot-instructions.md`** (auto-loaded por Copilot) |
| Cursor | `<repo>/.cursorrules` ou `<repo>/.cursor/rules/*.mdc` |
| Codex CLI | `<repo>/.codex/instructions.md` |
| Gemini CLI | `<repo>/.gemini/instructions.md` |
| Aider | `<repo>/.aider.conf.yml` ou `CONVENTIONS.md` |

Cada repo de projeto canonico DEVE ter o adapter do vendor que
sera usado nele. Bypass em adapter requer registro em
`loss_report` declarando porque o vendor alvo nao pode invocar a
CLI.

## Aplicacao

Esta regra e invariante. Bypass requer justificativa explicita
e impossibilidade tecnica documentada.
