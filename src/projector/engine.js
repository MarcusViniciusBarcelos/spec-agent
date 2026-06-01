import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

export function loadEngine(engineDir) {
  const rulesDir = join(engineDir, "rules");
  const skillsDir = join(engineDir, "skills");
  const rules = existsSync(rulesDir)
    ? readdirSync(rulesDir)
        .filter((f) => f.endsWith(".md"))
        .map((f) => ({ name: f, content: readFileSync(join(rulesDir, f), "utf8") }))
    : [];
  const skills = existsSync(skillsDir)
    ? readdirSync(skillsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => ({
          name: d.name,
          content: readFileSync(join(skillsDir, d.name, "SKILL.md"), "utf8"),
        }))
    : [];
  return { rules, skills };
}
