const NORM = /[^a-z0-9 ]+/g;
const normalize = (t) => t.toLowerCase().replace(NORM, "").trim();

export function trigrams(text) {
  const n = normalize(text);
  if (n.length < 3) return new Set(n ? [n] : []);
  const s = new Set();
  for (let i = 0; i <= n.length - 3; i++) s.add(n.slice(i, i + 3));
  return s;
}

export function jaccard(a, b) {
  const ta = trigrams(a), tb = trigrams(b);
  if (ta.size === 0 && tb.size === 0) return 1;
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const g of ta) if (tb.has(g)) inter++;
  const union = ta.size + tb.size - inter;
  return union ? inter / union : 0;
}

export function isDuplicate(newDesc, existing, threshold = 0.6) {
  return existing.some((d) => jaccard(newDesc, d) >= threshold);
}

export function meetsThreshold({ occurrences, distinctTasks, daysSpan, signal }) {
  if (signal === "user-flag") return true;
  return occurrences >= 3 && distinctTasks >= 2 && daysSpan <= 30;
}
