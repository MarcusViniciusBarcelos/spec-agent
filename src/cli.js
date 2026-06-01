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

  program.command("validate").description("(reservado) checa coerência do .spec/").action(() => {});

  program.parse(argv);
}
