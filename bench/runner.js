import { extractSolution } from "./extract.js";
import { BASELINE_PROMPT, buildRulesPrompt } from "./harness-prompt.js";
import { runGate } from "./gate.js";

const SYSTEM = {
  baseline: () => BASELINE_PROMPT,
  "rules-only": (engineDir) => buildRulesPrompt(engineDir),
  "full-harness": (engineDir) => buildRulesPrompt(engineDir),
};

async function callAgent(client, model, system, userText, tokenBox) {
  const resp = await client.messages.create({
    model,
    max_tokens: 1024,
    system,
    messages: [{ role: "user", content: userText }],
  });
  tokenBox.tokens += (resp.usage?.input_tokens ?? 0) + (resp.usage?.output_tokens ?? 0);
  const text = resp.content.map((c) => (c.type === "text" ? c.text : "")).join("");
  return extractSolution(text);
}

export async function runTask(task, condition, { client, model, engineDir = "src/engine" }) {
  const system = SYSTEM[condition](engineDir);
  const tokenBox = { tokens: 0 };
  const solution = await callAgent(client, model, system, task.prompt, tokenBox);

  if (condition === "full-harness") {
    const regenerate = (failure) => callAgent(client, model, system, `${task.prompt}\n\n${failure}`, tokenBox);
    const g = await runGate(solution, task.checker, regenerate);
    return {
      condition,
      taskId: task.id,
      kind: task.kind,
      success: g.passed,
      tokens: tokenBox.tokens,
      gateCaught: g.gateCaught,
    };
  }
  return {
    condition,
    taskId: task.id,
    kind: task.kind,
    success: !!task.checker(solution),
    tokens: tokenBox.tokens,
    gateCaught: false,
  };
}
