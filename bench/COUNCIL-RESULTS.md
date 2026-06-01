# council bench v2 — orquestração multi-agente (in-environment)

> Método: rodado **dentro de um agente de código** (Claude Code, modelo `haiku`), via subagents isolados. Cada subagent foi instruído a NÃO usar ferramentas nem ler arquivos (decisão pura, sem exploração de codebase que contaminaria a comparação). Compara **single-pass** (1 agente decide) vs **council** (N personas independentes + chairman sintetiza).

## A pergunta

O council multi-persona entrega diferencial mensurável sobre um único pass do mesmo modelo? Em quê?

## Suite v2 — 5 decisões com falha SUTIL

Diferente da v1 (falhas de manual: deadlock/N+1/race, que o single-pass mata trivialmente), a v2 usa falhas sutis onde um pass plausivelmente erra — **mais 1 controle são** (tradeoff conscientemente aceito, que NÃO deve ser rejeitado):

| # | decisão | tipo | falha embutida |
|---|---|---|---|
| S1 | idempotência por hash de conteúdo (valor+data) | falha | dois pagamentos legítimos iguais colidem; chave devia vir do cliente |
| S2 | cache de uma cotação com chave (cliente, produto) | falha | chave omite valor/prazo → resultado errado servido |
| S3 | notify-then-commit (publica antes de commitar) | falha | se commit falha após publish, operador notificado sem ticket na fila |
| S4 | paginação por OFFSET | falha | inserts concorrentes → saltos/duplicatas; cursor/keyset resolve |
| S5 | **UUID v4 como PK (tradeoff são)** | **controle** | **nenhuma — tradeoff legítimo; rejeitar = over-flag** |

## Resultado

### Detecção de falha — SEM headroom

Single-pass haiku pegou **4/4** das falhas sutis (S1–S4), com diagnóstico correto e fix recomendado em cada uma. O council pegaria também, mas **não adiciona nada mensurável** aqui: o modelo base já é capaz demais nessa faixa. (Mesma lição da v1 e do bench de código: diferencial de detecção é difícil de mostrar quando o modelo base é forte.)

### Calibração — diferencial DEMONSTRADO (a virada)

O sinal novo está no **controle S5**:

| condição | custo | veredito S5 (tradeoff são) | correto? |
|---|---|---|---|
| **single-pass ingênuo** | 1× | **REJEITOU** — "use auto-increment" | ❌ over-flag |
| **single-pass self-debate** | 1× | **REJEITOU** — "premature optimization" | ❌ over-flag |
| **council** (4 personas + chairman) | 5× | **APROVOU com ressalvas** | ✅ calibrado |

Personas do council em S5: `executor` aprovou (KISS, standard de mercado), `expansionista` aprovou (destrava sharding/geração no cliente), `arquitetura` aprovou com ressalvas (documentar imutabilidade + `created_at` + teste de índice), `contrário` levantou riscos mas propôs **híbrido** (UUID público / int no core quente) — não vetou. O **chairman** sintetizou: **APROVAR**, absorvendo a mitigação do contrário como risco residual em vez de bloquear.

**O teste decisivo (o que justifica os 5×):** tentei replicar a calibração no custo 1× — um único agente instruído a fazer **steelman dos dois lados** E perguntar explicitamente "isto é um tradeoff conscientemente aceito?". **Ainda rejeitou** (over-flag). O viés de aversão a risco que dirige a rejeição ingênua **também dirige o passo de decisão** do self-debate — um contexto único tem uma voz só; argumentar consigo mesmo não escapa do próprio prior. O council funciona porque cada persona **commita** numa função-objetivo distinta (executor=KISS, expansionista=opcionalidade futura) e o chairman agrega commitments genuínos, não o hedge de um modelo só.

**A leitura:** o diferencial do council não é pegar mais falhas (single-pass faz 4/4) — é **evitar o falso-bloqueio (over-flag) num tradeoff consciente**, e esse diferencial específico **resistiu à replicação barata**. É a única dimensão onde os 5× compraram algo que 1× não compra.

## Controles sãos adicionais — n=4 (sinal sólido)

Para sair do n=1, rodei +3 tradeoffs legítimos (aprovar = certo; rejeitar = over-flag), cada um nas 3 condições:

| tradeoff são | naive 1× | self-debate 1× | council 5× |
|---|---|---|---|
| S5 · UUID v4 como PK | REJEITAR ❌ | REJEITAR ❌ | APROVAR ✅ |
| C1 · réplica de leitura c/ lag ~5s | APROVAR ✅ | APROVAR ✅ | APROVAR ✅ |
| C2 · denormalizar `customer_name` em `orders` | APROVAR ✅ | **REJEITAR ❌** | APROVAR ✅ |
| C3 · try/except em notify acessório | APROVAR ✅ | APROVAR ✅ | APROVAR ✅ |
| **taxa de over-flag (menor=melhor)** | **1/4** | **2/4** | **0/4** |

Três achados, todos honestos:

1. **Council 0/4 — calibração perfeita nos sãos.** Nunca bloqueou um tradeoff legítimo. Vindica o diferencial de S5 num n maior.
2. **O over-flag do single-pass é real mas intermitente (naive 1/4).** Depende de quão *carregado de dogma* é o tradeoff: UUID-vs-int (S5) é tópico de guerra-santa → over-flag. Réplica (C1) e try/except-acessório (C3) são pouco-dogmáticos → passaram. Denormalização (C2) é carregado → naive acertou, mas o self-debate tropeçou.
3. **A correção barata (self-debate) PIORA, não melhora (2/4).** Mandar o modelo "defender os dois lados" num contexto único **surfou mais objeções** e o empurrou pra rejeição (C2: naive aprovou, self-debate rejeitou). Não dá pra *conversar* um modelo único pra fora do over-flag — precisa de perspectivas que **commitam** de verdade. Isso fortalece o caso de que a calibração exige a estrutura multi-agente, não mais deliberação.

## Conclusão (n=4)

O council **não é bloat** no eixo de calibração: **0/4** over-flag vs naive **1/4** vs self-debate **2/4**, e a alternativa barata **degrada** em vez de replicar. Mas a **magnitude é modesta**: o single-pass ingênuo só erra ~1 em 4 tradeoffs sãos, e só nos *carregados de dogma*. Tradução operacional:

> O council paga os 5× **só** quando a decisão é (a) ambígua/dogma-charged E (b) o custo de um falso-bloqueio é alto (matar um tradeoff legítimo = retrabalho, over-engineering imposto, atraso). Fora disso — detecção de falha, decisão clara, tradeoff pouco-polêmico — é desperdício. Reforça a fronteira do manifesto (council só em planning/escalada) e sugere estreitá-la ainda mais: *tradeoffs arquiteturais ambíguos e polêmicos*, não toda decisão de planning.

**Ressalva mantida:** decisões em **isolamento** (sem tools/codebase) maximizam o sinal de over-flag; numa sessão real de planning, o contexto do projeto pode recalibrar o single-pass. E "aprovar = certo" nos 4 controles é julgamento meu como autor — mas os 4 são tradeoffs uncontroversially sãos.

## Custo

- single-pass: ~82k tokens / decisão.
- council (4 personas + chairman): ~412k tokens / decisão (**~5×**).

O valor de calibração só paga 5× em **decisões de alto risco e ambíguas**, onde um falso-bloqueio é caro (retrabalho, over-engineering imposto, oportunidade perdida). Em decisão trivial ou claramente errada, o single-pass basta — e é por isso que o manifesto invoca council **só em planning/escalada**, não por turno.

## Ressalvas honestas

- **n=1 controle**: o "over-flag corrigido" é um ponto único. O que vale é a **direção** (valor do council = calibração anti-over-flag), não uma taxa quantificada. Mais controles sãos dariam variância real.
- **Modelo capaz** (haiku): num modelo mais fraco, o council provavelmente recuperaria *também* em detecção, não só em calibração.
- Decisão isolada (sem ferramentas) é o teste limpo da deliberação; numa tarefa real, exploração de codebase muda o jogo (e foi o que contaminou o "controle" da v1).

**Entregável real:** confirmação honesta de que a orquestração council tem um diferencial **específico e localizável** (calibração / anti-over-flag em decisão ambígua de alto risco), distinto do gate de verificação (que pega erro de implementação). Os dois cobrem falhas diferentes — não competem.
