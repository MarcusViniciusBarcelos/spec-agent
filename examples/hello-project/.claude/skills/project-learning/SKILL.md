---
name: project-learning
description: Captura, consulta e promocao de aprendizado duravel
  por projeto. Mandataria ao lado de agent-council e
  context-economy. Implementa progressive disclosure (3-layer),
  privacy controls e AI-compressed summaries via prompt-only.
type: governance
mandatory: true
---

# Skill: Project Learning

## Quando invocar

Inicio de sessao (carrega INDEX) + sob trigger de captura/consulta.

## Protocolo (8 sub-protocolos basicos + 3 do claude-mem)

1. Carregamento inicial — ler INDEX.md no inicio de sessao
2. Deteccao de sinais de captura — tabela de gatilhos
3. Escrita em _pending — formato canonico de entrada
4. Deteccao de necessidade de consulta — tabela de triggers
5. Consulta direcionada — so categoria relevante
6. Promocao do _pending — criterio objetivo + override usuario
7. Consolidacao — mesclar duplicatas, descartar obsoleto
8. Format de entrada — schema padrao por categoria
9. 3-layer query — progressive disclosure
10. Privacy filter — pre-escrita
11. AI-compressed summary format — entrada com summary curto + body

## Schema de entrada (com metadados, alinhado ao claude-mem)

Toda entrada (em _pending ou durable) tem:

    id: C001 | P001 | L001 | etc.
    summary: "1-2 frases — resumo semantico para skim rapido"
    body: |
      Detalhamento, exemplos, evidencia (opcional)
    metadata:
      captured_at: YYYY-MM-DD
      source: <session_id ou path:linha que motivou>
      occurrences: <contador para promocao>
      status: pending | durable | contested | obsolete
      last_validated: YYYY-MM-DD
      promoted_at: YYYY-MM-DD (se aplicavel)

## Sub-protocolo 1: Carregamento inicial

No inicio de sessao em projeto canonico:
- carregar `projects/<project>/learning/INDEX.md` via Read
- nao carregar categorias detalhadas (Layer 2/3 sob demanda)
- nao carregar `_pending/` (estado em transicao)

## Sub-protocolo 2: Deteccao de sinais de captura

Triggers em PL-01 + um trigger adicional:

| Sinal | Categoria |
|---|---|
| Usuario corrigiu padrao proposto | pitfalls |
| Erro do agent + correcao | pitfalls |
| Convencao 3+ vezes em arquivos diferentes | conventions |
| Decisao validada explicitamente | lessons |
| Termo clarificado pelo usuario | glossary |
| Solucao para problema repetido | patterns |
| Tool retorna erro recorrente com causa comum | pitfalls |

## Sub-protocolo 3: Escrita em _pending

Formato:

    ## <id>: <summary curto>

    **Captured**: 2026-04-30
    **Source**: session_xyz / app/foo.py:42
    **Occurrences**: 1
    **Status**: pending

    ### Body (opcional)

    [detalhamento]

Atualiza apenas `_pending/<categoria>.md`.
NAO toca em INDEX.md ate promocao.

## Sub-protocolo 4: Deteccao de necessidade de consulta

Antes destas acoes, consulta:

| Acao | Categoria |
|---|---|
| propor padrao novo | patterns, conventions |
| implementar em area conhecida | pitfalls |
| usar termo de dominio | glossary |
| decisao estrutural | lessons |

## Sub-protocolo 5: Consulta direcionada

Sempre comecar pelo INDEX (Layer 1). Subir para categoria
(Layer 2) e entrada (Layer 3) conforme necessidade.

## Sub-protocolo 6: Promocao do _pending

Quando criterio bate (PL-04):
- recorrencia >=3 em sessoes diferentes, OU
- usuario valida explicitamente, OU
- pitfall com correcao pelo usuario (imediato)

Move entrada de `_pending/<cat>.md` para `<cat>.md` (durable),
adiciona linha em INDEX.md, sinaliza ao usuario (PL-10).

## Sub-protocolo 7: Consolidacao

Trimestral ou quando categoria ultrapassa cap (PL-05):
- agent propoe ao usuario consolidacao
- deduplicar, mesclar similares, descartar obsoletas
- usuario aprova mudancas em massa

## Sub-protocolo 8: Schema por categoria

### conventions.md
- **Padrao**: descricao curta
- **Onde**: path/modulo
- **Evidencia**: 3+ exemplos de ocorrencia
- **Aplicar quando**: condicao

### patterns.md
- **Problema**: recorrente
- **Solucao canonica**: como resolve
- **Exemplo**: path:linha

### pitfalls.md
- **Armadilha**: o que parece certo mas e errado
- **Erro cometido**: se foi erro do agent
- **Correcao**: pelo usuario ou pela propria sessao
- **Sintoma para detectar**: como identificar futuramente

### lessons.md
- **Decisao**: o que foi decidido
- **Contexto**: por que
- **Alternativas rejeitadas**: opcoes descartadas + razao

### glossary.md
- **Termo**: palavra
- **Significado neste projeto**: definicao local
- **Nao confundir com**: se houver homonimo

## Sub-protocolo 9: 3-layer query (progressive disclosure)

Quando agent precisa consultar learning:

1. Identificar pergunta concreta
2. Layer 1 — abrir INDEX.md, grep ou skim por palavras-chave
3. Se encontrou linhas relevantes → Layer 2: abrir o arquivo da
   categoria, listar entradas
4. Identificar IDs especificos (C001, P003)
5. Layer 3 — ler corpo completo apenas das entradas filtradas

Exemplo:
- Pergunta: "Como o projeto trata commits no repo?"
- Layer 1: grep "commit\|flush" INDEX.md → ve C001
- Layer 2: abre conventions.md, ve C001 = "Repos sempre flush(),
  middleware faz commit"
- Layer 3: nao precisa — Layer 2 ja respondeu

## Sub-protocolo 10: Privacy filter pre-escrita

Antes de escrever em _pending/:
1. Verificar se conteudo bate com regra HG-01 (credenciais/segredo)
2. Verificar se contem PII especifica (CPF de pessoa real, etc.)
3. Verificar se ha private_key_*.pem ou .env mencionado
4. Se SIM em qualquer um → NAO escreve, ou mascara com placeholder
5. Se conteudo veio com `<private>...</private>` → exclui o trecho

## Sub-protocolo 11: AI-compressed summary format

Cada entrada tem 2 niveis:
- **summary** (1-2 frases) — para Layer 1 do INDEX
- **body** (detalhamento) — para Layer 3 sob demanda

Disciplina:
- summary deve ser auto-suficiente para skim
- body so para casos onde summary nao basta
- entradas sem body sao validas
- entradas SO com body sao invalidas (sempre precisa summary)

## INDEX.md format (Layer 1)

| ID | Categoria | Summary (<=120 chars) | Status |
|---|---|---|---|
| C001 | conventions | Repos sempre flush(), middleware faz commit | durable |
| C002 | conventions | Imports agrupados em 4 grupos | durable |
| P001 | pitfalls | Nao criar Entity como plain class — sempre @dataclass | durable |
| L001 | lessons | UY3 stub nao e referencia: authenticate() retorna {} | durable |

Cap: ~80 linhas. Carregamento sempre.
