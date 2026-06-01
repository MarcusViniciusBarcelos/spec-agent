import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import yaml from "js-yaml";

const LEARNING_FILES = {
  "INDEX.md": "# Learning Index\n\n| ID | Categoria | Summary | Status |\n|---|---|---|---|\n",
  "conventions.md": "# Convenções\n",
  "patterns.md": "# Padrões\n",
  "pitfalls.md": "# Armadilhas\n",
  "lessons.md": "# Lições\n",
  "glossary.md": "# Glossário\n",
  "skill-candidates.md":
    "# Skill Candidates\n\n| id | sinal | descrição | ocor. | tarefas | first | last | pattern-key | escopo | status |\n|---|---|---|---|---|---|---|---|---|---|\n",
};

function writeIfAbsent(path, content, created) {
  if (existsSync(path)) return;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  created.push(path);
}

export function scaffoldProject(targetDir, manifest) {
  const created = [];
  const spec = join(targetDir, ".spec");
  writeIfAbsent(join(spec, "manifest.yaml"), yaml.dump(manifest), created);
  for (const [name, content] of Object.entries(LEARNING_FILES))
    writeIfAbsent(join(spec, "learning", name), content, created);
  writeIfAbsent(join(spec, "learning", "_pending", ".gitkeep"), "", created);
  writeIfAbsent(join(spec, "skills", ".gitkeep"), "", created);
  return created;
}
