function mean(xs) {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}
function stddev(xs) {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
}
function summarize(rows) {
  const succ = rows.map((r) => (r.success ? 1 : 0));
  const toks = rows.map((r) => r.tokens);
  const caught = rows.filter((r) => r.gateCaught).length;
  return {
    n: rows.length,
    successRate: { mean: mean(succ), stddev: stddev(succ) },
    tokens: { mean: mean(toks), stddev: stddev(toks) },
    gateCatchRate: rows.length ? caught / rows.length : 0,
  };
}
function groupBy(rows, key) {
  const out = {};
  for (const r of rows) (out[r[key]] ??= []).push(r);
  return out;
}

export function aggregate(results) {
  const byCondition = {};
  for (const [cond, rows] of Object.entries(groupBy(results, "condition"))) byCondition[cond] = summarize(rows);
  const byKind = {};
  for (const [kind, rows] of Object.entries(groupBy(results, "kind"))) {
    byKind[kind] = {};
    for (const [cond, r] of Object.entries(groupBy(rows, "condition"))) byKind[kind][cond] = summarize(r);
  }
  return { byCondition, byKind };
}
