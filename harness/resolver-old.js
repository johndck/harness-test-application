// resolver.js
import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';

const SKILLS_DIR = new URL('./library/skills', import.meta.url).pathname;

function loadSkillIndex(dir = SKILLS_DIR) {
  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const { data } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
      return { id: data.name, description: data.description, triggers: data.triggers, tools: data.tools };
    });
}

export function loadSkillBody(id, dir = SKILLS_DIR) {
  const file = fs.readdirSync(dir).find(f => matter(fs.readFileSync(path.join(dir, f), 'utf8')).data.name === id);
  if (!file) throw new Error(`Skill not found: ${id}`);
  return matter(fs.readFileSync(path.join(dir, file), 'utf8')).content;
}

export function resolveSkill(task, dir = SKILLS_DIR) {
  const index = loadSkillIndex(dir);
  const matched = index.find(skill =>
    skill.triggers?.some(trigger => task.toLowerCase().includes(trigger.toLowerCase()))
  );
  return matched ?? null; // null means: no keyword match, fall back to LLM classification
}

export function loadSkillIndex() {
  return loadSkillIndex(SKILLS_DIR);
}