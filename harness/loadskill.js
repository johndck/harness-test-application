// loadSkill.js: reads a skill file and splits it into tools + body.
// No LLM call here. Plain file reading.
import fs from "fs/promises";
import matter from "gray-matter";

const SKILLS_DIR = "library/skills";

function todayString() {
  const now = new Date();
  const weekday = now.toLocaleDateString("en-GB", { weekday: "long" });
  const isoDate = now.toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
  return `${weekday} ${isoDate}`;
}

async function loadSkill(name, logger) {
  try {
    const raw = await fs.readFile(`${SKILLS_DIR}/${name}.md`, "utf8");
    const { data, content } = matter(raw);

    // Empty stub (e.g. meeting-actions for now)
    if (!content.trim()) {
      logger?.log("skill_empty", { name });
      return null;
    }

    return {
      name: data.name ?? name,
      tools: Array.isArray(data.tools) ? data.tools : [],
      body: content.replaceAll("{{today}}", todayString()),
    };
  } catch (error) {
    // Missing file, bad path, or a YAML error in the frontmatter
    logger?.error("skill_load_failed", error);
    return null;
  }
}

export default loadSkill;