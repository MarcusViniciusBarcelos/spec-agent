import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

export const BASELINE_PROMPT =
  "Você é um engenheiro. Resolva a tarefa pedida e responda apenas com o código solicitado.";

export function buildRulesPrompt(engineDir) {
  const rulesDir = join(engineDir, "rules");
  const rules = existsSync(rulesDir)
    ? readdirSync(rulesDir)
        .filter((f) => f.endsWith(".md"))
        .map((f) => readFileSync(join(rulesDir, f), "utf8"))
        .join("\n\n")
    : "";
  return `${BASELINE_PROMPT}\n\nSiga estas regras do harness:\n\n${rules}`;
}
