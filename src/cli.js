import { Command } from "commander";

export function run(argv) {
  const program = new Command();
  program.name("spec-agent").version("0.1.0");

  program
    .command("init")
    .description("scaffold .spec/ + project adapters for the selected coding agents")
    .requiredOption("--id <id>", "project id")
    .option("--agents <list>", "comma-separated coding agents: claude,agents-md,copilot", "claude")
    .action(async (o) => {
      const { runInit } = await import("./commands/init.js");
      const manifest = await runInit({ cwd: process.cwd(), id: o.id, vendors: o.agents.split(",") });
      console.log(`spec-agent: init '${manifest.id}' para ${manifest.vendors.join(", ")}`);
    });

  program
    .command("sync")
    .description("re-project adapters from the engine; never touches .spec/learning or .spec/skills")
    .option("--agents <list>", "add coding agents to the project (comma-separated): claude,agents-md,copilot")
    .action(async (o) => {
      const { runSync } = await import("./commands/sync.js");
      const agents = o.agents ? o.agents.split(",") : [];
      const manifest = await runSync({ cwd: process.cwd(), agents });
      console.log(`spec-agent: sync '${manifest.id}' (${manifest.vendors.join(", ")})`);
    });

  program
    .command("verify")
    .description("run the project's gate (checks) and print a human-readable verdict; exits non-zero if blocked (CI/PR)")
    .action(async () => {
      const { execSync } = await import("node:child_process");
      const { runVerify, renderVerdict } = await import("./commands/verify.js");
      const run = (cmd, cwd) => {
        try {
          execSync(cmd, { cwd, stdio: "pipe" });
          return { ok: true };
        } catch (e) {
          const raw = e.stdout?.toString() || e.stderr?.toString() || e.message || "";
          const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
          const msg =
            lines.find((l) => /invariant|AssertionError|Error:/i.test(l)) ||
            lines.find((l) => /^✖|not ok|\bFAIL\b/i.test(l)) ||
            lines.slice(-1)[0] ||
            "check failed";
          return { ok: false, detail: msg.replace(/^AssertionError \[[^\]]+\]:\s*/, "") };
        }
      };
      const result = runVerify({ cwd: process.cwd(), run });
      console.log(renderVerdict(result));
      process.exit(result.verdict === "PASSED" ? 0 : 1);
    });

  program.parse(argv);
}
