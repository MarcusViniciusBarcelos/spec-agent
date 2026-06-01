const pct = (x) => `${(x * 100).toFixed(0)}%`;
const f1 = (x) => x.toFixed(1);

export function renderReport(agg) {
  const rows = Object.entries(agg.byCondition)
    .map(
      ([c, s]) =>
        `| ${c} | ${pct(s.successRate.mean)} ±${pct(s.successRate.stddev)} | ${f1(s.tokens.mean)} ±${f1(
          s.tokens.stddev
        )} | ${pct(s.gateCatchRate)} | ${s.n} |`
    )
    .join("\n");
  const markdown = [
    `# spec-agent bench`,
    ``,
    `| condição | success rate | tokens/tarefa | gate-catch | n |`,
    `|---|---|---|---|---|`,
    rows,
    ``,
    `## Leitura honesta`,
    `- O full-harness adiciona tokens (prompt + fix-loop) — compare a coluna de tokens.`,
    `- gate-catch = % de tarefas onde a 1ª tentativa falhou e o gate corrigiu.`,
    `- N pequeno: trate como indicativo, não prova estatística. Tarefas e checkers são abertos/reproduzíveis.`,
  ].join("\n");
  return { markdown, json: JSON.stringify(agg, null, 2) };
}
